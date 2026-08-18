// scripts/publish.js

import courses from "../courses/index.js";
import TaleemPublish from "../src/publisher/TaleemPublish.js";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

let failed = false;

for (const [courseSlug, course] of Object.entries(courses)) {

	console.log(`\n========================================`);
	console.log(`Publishing: ${course.title}`);
	console.log(`Course: ${courseSlug}`);
	console.log(`========================================`);

	try {

		const publisher = new TaleemPublish(courseSlug);

		await publisher.publish();

		console.log(`✓ Published ${courseSlug}`);

	}
	catch (error) {

		console.error(
			`✗ Failed ${courseSlug}: ${error.message}`
		);

		failed = true;

	}

}

if (!failed) {

	console.log(`\n========================================`);
	console.log(`Adding admins`);
	console.log(`========================================`);

	try {

		await execFileAsync(
			"node",
			["scripts/addAdmins.js"]
		);

		console.log(`✓ Admins processed`);

	}
	catch (error) {

		console.error(
			`✗ Failed to add admins: ${error.message}`
		);

		failed = true;

	}

}

if (failed) {
	process.exitCode = 1;
}