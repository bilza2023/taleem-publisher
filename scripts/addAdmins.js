import fs from "fs";
import path from "path";
import kernel from "../src/serverKernel/ServerKernel.js";

const file = path.resolve("content", "admins.json");

if (!fs.existsSync(file)) {
	throw new Error(`Admins file not found: ${file}`);
}

const admins = JSON.parse(
	fs.readFileSync(file, "utf8")
);

const superAdmins = admins.filter(
	admin => admin.role === "SUPER_ADMIN"
);

if (superAdmins.length > 1) {
	throw new Error(
		`Only one SUPER_ADMIN is allowed. Found ${superAdmins.length}.`
	);
}

const existingSuperAdmin =
	await kernel.db.admin.findFirst({
		where: {
			role: "SUPER_ADMIN"
		}
	});

if (existingSuperAdmin && superAdmins.length > 0) {
	const requested = superAdmins[0];

	if (existingSuperAdmin.email !== requested.email) {
		throw new Error(
			`SUPER_ADMIN already exists: ${existingSuperAdmin.email}`
		);
	}
}

for (const admin of admins) {

	if (!admin.email || !admin.password) {
		throw new Error(
			"Admin requires email and password."
		);
	}

	const existing =
		await kernel.db.admin.findUnique({
			where: {
				email: admin.email
			}
		});

	if (existing) {
		console.log(
			`Admin exists: ${admin.email} — skipped`
		);
		continue;
	}

	await kernel.admin.create({
		email: admin.email,
		password: admin.password,
		role: admin.role || "ADMIN",
		courseSlugs: JSON.stringify(
			admin.courses || []
		)
	});

	console.log(
		`Admin created: ${admin.email}`
	);
}

await kernel.shutdown();