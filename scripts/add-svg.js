import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFile = path.join(__dirname, "..", "svg.json");
const svgDir = path.join(__dirname, "..", "svgs");

try {
	const data = JSON.parse(fs.readFileSync(sourceFile, "utf8"));

	if (!data.slug) throw new Error("SVG slug is required.");
	if (!data.body) throw new Error("SVG body is required.");

	fs.mkdirSync(svgDir, { recursive: true });

	const targetFile = path.join(svgDir, `${data.slug}.svg`);

	if (fs.existsSync(targetFile)) {
		throw new Error(`SVG "${data.slug}" already exists. File was not overwritten.`);
	}

	fs.writeFileSync(targetFile, data.body, "utf8");
	fs.writeFileSync(sourceFile, "", "utf8");

	console.log("SVG added successfully:");
	console.log(`  slug : ${data.slug}`);
	console.log(`  title: ${data.title || ""}`);
	console.log(`  file : ${targetFile}`);
}
catch (error) {
	console.error("Failed to add SVG:");
	console.error(error.message);
	process.exitCode = 1;
}