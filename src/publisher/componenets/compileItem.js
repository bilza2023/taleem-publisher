import fs from "fs";
import path from "path";

export default function compileItem({
	slug,
	grouping,
	groupingDir,
	course,
	sortOrder
}) {

	const file = path.join(
		groupingDir,
		`${slug}.json`
	);

	if (!fs.existsSync(file)) return null;

	const raw = fs.readFileSync(file, "utf8");

	if (!raw.trim()) return null;

	let content;

	try {
		content = JSON.parse(raw);
	}
	catch (error) {
		throw new Error(
			`Cannot read ${file}: ${error.message}`
		);
	}

	if (!content.title)
		throw new Error(`${slug}: title is missing`);

	if (!content.type)
		throw new Error(`${slug}: type is missing`);

	if (
		content.type !== "ARTICLE" &&
		content.type !== "PLAYER"
	) {
		throw new Error(
			`${slug}: unsupported content type "${content.type}"`
		);
	}

	if (
		content.body === undefined ||
		content.body === null
	) {
		throw new Error(`${slug}: body is missing`);
	}

	const body =
		typeof content.body === "string"
			? content.body
			: JSON.stringify(content.body);

	return {
		slug,
		title: content.title,
		description: content.description,
		thumbnail:
			content.thumbnail ||
			grouping.thumbnail ||
			course.thumbnail,
		type: content.type,
		body,
		sortOrder
	};
}