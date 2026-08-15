export default function trimSyllabus(items, library) {

	const compiled = new Set(
		library.map(item => item.slug)
	);

	return items.filter(
		slug => compiled.has(slug)
	);

}