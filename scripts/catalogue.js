import fs from "fs";
import path from "path";

const svgDir = path.resolve("svgs");
const output = path.resolve("svgs-index.json");

const files = fs.readdirSync(svgDir)
	.filter(file => file.endsWith(".json"));

const catalogue = files.map(file => {
	const data = JSON.parse(
		fs.readFileSync(path.join(svgDir, file), "utf8")
	);

	return {
		slug: data.slug,
		title: data.title,
		tags: data.tags || []
	};
});

fs.writeFileSync(
	output,
	JSON.stringify(catalogue, null, 2)
);

console.log(`✓ SVG catalogue generated: ${catalogue.length} items`);