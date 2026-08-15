export default class Groupings {

	constructor(kernel) {
		this.kernel = kernel;
	}

	// --------------------------------------------------
	// Queries
	// --------------------------------------------------

	async list(filters = {}) {

		const where = {};

		if (filters.courseId) {
			where.courseId = filters.courseId;
		}

		return this.kernel.db.grouping.findMany({
			where,
			orderBy: {
				sortOrder: "asc"
			}
		});

	}

	async get(id) {

		return this.kernel.db.grouping.findUnique({
			where: { id }
		});

	}

	// --------------------------------------------------
	// CRUD
	// --------------------------------------------------

	async create(data) {

		return this.kernel.db.grouping.create({
			data
		});

	}

	async update(id, data) {

		return this.kernel.db.grouping.update({
			where: { id },
			data
		});

	}

	async delete(id) {

		return this.kernel.db.grouping.delete({
			where: { id }
		});

	}

	// --------------------------------------------------
	// Utilities
	// --------------------------------------------------

	async slugToId(courseId, slug) {

		const grouping = await this.kernel.db.grouping.findUnique({
			where: {
				courseId_slug: {
					courseId,
					slug
				}
			},
			select: { id: true }
		});

		if (!grouping) {
			throw new Error(`Grouping "${slug}" not found.`);
		}

		return grouping.id;

	}

	async idToSlug(id) {

		const grouping = await this.kernel.db.grouping.findUnique({
			where: { id },
			select: { slug: true }
		});

		if (!grouping) {
			throw new Error(`Grouping "${id}" not found.`);
		}

		return grouping.slug;

	}

}