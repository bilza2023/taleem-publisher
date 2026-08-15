import fs from "fs";

export default function loadCourse(courseFile, contentDir) {

	if (!fs.existsSync(courseFile))
		throw new Error(`Course file not found: ${courseFile}`);

	if (!fs.existsSync(contentDir))
		throw new Error(`Content directory not found: ${contentDir}`);

	let course;

	try {
		course = JSON.parse(
			fs.readFileSync(courseFile, "utf8")
		);
	}
	catch (error) {
		throw new Error(
			`Invalid course file: ${error.message}`
		);
	}

	if (!course.slug)
		throw new Error("Course slug is missing");

	if (!course.title)
		throw new Error("Course title is missing");

	return course;
}