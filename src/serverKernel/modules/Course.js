// src/serverKernel/modules/Course.js

export default class Course {

	constructor(kernel) {
		this.kernel = kernel;
	}

	// --------------------------------------------------
	// Queries
	// --------------------------------------------------

	async list(filters = {}) {

		const where = {};

		if (filters.access) {
			where.access = filters.access;
		}

		return this.kernel.db.course.findMany({
			where
		});

	}

	async get(id) {

		return this.kernel.db.course.findUnique({
			where: { id }
		});

	}

	// --------------------------------------------------
	// CRUD
	// --------------------------------------------------

	async create(data) {

		return this.kernel.db.course.create({
			data
		});

	}

	async update(id, data) {

		return this.kernel.db.course.update({
			where: { id },
			data
		});

	}

	async delete(id) {

		return this.kernel.db.course.delete({
			where: { id }
		});

	}

	// --------------------------------------------------
	// Utilities
	// --------------------------------------------------

	async slugToId(slug) {

		const course = await this.kernel.db.course.findUnique({
			where: { slug },
			select: { id: true }
		});

		if (!course) {
			throw new Error(`Course "${slug}" not found.`);
		}

		return course.id;

	}

	async idToSlug(id) {

		const course = await this.kernel.db.course.findUnique({
			where: { id },
			select: { slug: true }
		});

		if (!course) {
			throw new Error(`Course "${id}" not found.`);
		}

		return course.slug;

	}

}