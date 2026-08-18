// /home/bilal-tariq/00--TALEEM/taleem-library/scripts/publish-course.js
import fs from "fs";
import path from "path";
import kernel from "../src/serverKernel/ServerKernel.js";

const courseSlug = process.argv[2];

if (!courseSlug) {
	console.error("Usage: node scripts/publish-course.js <course-slug>");
	process.exit(1);
}

const courseFile = path.resolve(
	"courses",
	courseSlug,
	`${courseSlug}.json`
);

const contentDir = path.resolve(
	"content",
	courseSlug
);

if (!fs.existsSync(courseFile)) {
	console.error(`Course file not found: ${courseFile}`);
	process.exit(1);
}

if (!fs.existsSync(contentDir)) {
	console.error(`Content directory not found: ${contentDir}`);
	process.exit(1);
}

const course = JSON.parse(
	fs.readFileSync(courseFile, "utf8")
);

console.log(`\nPublishing: ${course.title}`);
console.log(`Course: ${course.slug}\n`);

let published = 0;
let updated = 0;
let failed = 0;
let missing = 0;
let orphan = 0;

// --------------------------------------------------
// Verify course
// --------------------------------------------------

const dbCourse = await kernel.db.course.findUnique({
	where: {
		slug: course.slug
	}
});

if (!dbCourse) {

	console.error(
		`Course "${course.slug}" does not exist in database.`
	);

	await kernel.shutdown();
	process.exit(1);

}

// --------------------------------------------------
// Build syllabus index
// --------------------------------------------------

const syllabus = new Map();

for (const grouping of course.groupings || []) {

	for (const slug of grouping.items || []) {
		syllabus.set(slug, grouping);
	}

}

// --------------------------------------------------
// Process groupings
// --------------------------------------------------

for (const grouping of course.groupings || []) {

	console.log(`\n${grouping.title}`);

	// --------------------------------------------------
	// Verify grouping
	// --------------------------------------------------

	const dbGrouping = await kernel.db.grouping.findFirst({
		where: {
			slug: grouping.slug,
			courseId: dbCourse.id
		}
	});

	if (!dbGrouping) {

		console.log(
			`  ✗ grouping "${grouping.slug}" does not exist`
		);

		failed++;

		continue;

	}

	const groupingDir = path.join(
		contentDir,
		grouping.slug
	);

	// --------------------------------------------------
	// Verify grouping directory
	// --------------------------------------------------

	if (!fs.existsSync(groupingDir)) {

		for (const slug of grouping.items || []) {

			console.log(
				`  ✗ ${slug} — content missing`
			);

			missing++;

		}

		continue;

	}

	// --------------------------------------------------
	// Process syllabus items
	// --------------------------------------------------

	for (const slug of grouping.items || []) {

		const file = path.join(
			groupingDir,
			`${slug}.json`
		);

		if (!fs.existsSync(file)) {

			console.log(
				`  ✗ ${slug} — content missing`
			);

			missing++;

			continue;

		}

		try {

			const content = JSON.parse(
				fs.readFileSync(file, "utf8")
			);

			// --------------------------------------------------
			// Validate item
			// --------------------------------------------------

			if (!content.title) {
				throw new Error("title is missing");
			}

			if (!content.type) {
				throw new Error("type is missing");
			}

			const allowedTypes = [
				"ARTICLE",
				"PLAYER",
				"MCQ"
			];

			if (!allowedTypes.includes(content.type)) {

				throw new Error(
					`unsupported content type "${content.type}"`
				);

			}

			if (
				content.body === undefined ||
				content.body === null
			) {

				throw new Error(
					"body is missing"
				);

			}

			// --------------------------------------------------
			// Body
			//
			// The content file owns the complete body.
			// We do not interpret or modify it.
			// --------------------------------------------------

			const body =
				typeof content.body === "string"
					? content.body
					: JSON.stringify(content.body);

			// --------------------------------------------------
			// Thumbnail inheritance
			// --------------------------------------------------

			const thumbnail =
				content.thumbnail ||
				grouping.thumbnail ||
				course.thumbnail;

			// --------------------------------------------------
			// Library data
			// --------------------------------------------------

			const data = {

				title: content.title,

				thumbnail,

				body,

				type: content.type,

				course: {
					connect: {
						id: dbCourse.id
					}
				},

				grouping: {
					connect: {
						id: dbGrouping.id
					}
				}

			};

			// --------------------------------------------------
			// Existing item?
			// --------------------------------------------------

			const existing =
				await kernel.db.library.findUnique({
					where: {
						slug
					}
				});

			// --------------------------------------------------
			// Update
			// --------------------------------------------------

			if (existing) {

				await kernel.library.update(
					existing.id,
					data
				);

				console.log(
					`  ↻ ${slug} [${content.type}]`
				);

				updated++;

			}

			// --------------------------------------------------
			// Create
			// --------------------------------------------------

			else {

				await kernel.library.create({

					slug,

					...data

				});

				console.log(
					`  ✓ ${slug} [${content.type}]`
				);

				published++;

			}

		}

		catch (error) {

			console.log(
				`  ✗ ${slug} — ${error.message}`
			);

			failed++;

		}

	}

	// --------------------------------------------------
	// Detect orphan content
	// --------------------------------------------------

	for (const filename of fs.readdirSync(groupingDir)) {

		if (!filename.endsWith(".json")) {
			continue;
		}

		const slug = filename.replace(
			/\.json$/,
			""
		);

		if (!syllabus.has(slug)) {

			console.log(
				`  ⚠ ${slug} — orphan content`
			);

			orphan++;

		}

	}

}

// --------------------------------------------------
// Final summary
// --------------------------------------------------

console.log(`
--------------------------------
Published : ${published}
Updated   : ${updated}
Missing   : ${missing}
Orphans   : ${orphan}
Failed    : ${failed}
--------------------------------
`);

await kernel.shutdown();

if (failed || missing || orphan) {
	process.exitCode = 1;
}