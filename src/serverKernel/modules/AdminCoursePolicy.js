// src/serverKernel/modules/AdminCoursePolicy.js

export default class AdminCoursePolicy {

	constructor(kernel) {
		this.kernel = kernel;
	}

	// --------------------------------------------------
	// Queries
	// --------------------------------------------------

	async list(filters = {}) {

		const where = {};

		if (filters.adminId) {
			where.adminId = filters.adminId;
		}

		if (filters.courseId) {
			where.courseId = filters.courseId;
		}

		return this.kernel.db.adminCoursePolicy.findMany({
			where
		});

	}

	async get(id) {

		return this.kernel.db.adminCoursePolicy.findUnique({
			where: { id }
		});

	}

	// --------------------------------------------------
	// CRUD
	// --------------------------------------------------

	async create(data) {

		return this.kernel.db.adminCoursePolicy.create({
			data
		});

	}

	async update(id, data) {

		return this.kernel.db.adminCoursePolicy.update({
			where: { id },
			data
		});

	}

	async delete(id) {

		return this.kernel.db.adminCoursePolicy.delete({
			where: { id }
		});

	}

	// --------------------------------------------------
	// Utilities
	// --------------------------------------------------

	async getForAdminCourse(adminId, courseId) {

		return this.kernel.db.adminCoursePolicy.findUnique({
			where: {
				adminId_courseId: {
					adminId,
					courseId
				}
			}
		});

	}

	async upsert(adminId, courseId, data) {

		return this.kernel.db.adminCoursePolicy.upsert({

			where: {
				adminId_courseId: {
					adminId,
					courseId
				}
			},

			update: data,

			create: {
				adminId,
				courseId,
				...data
			}

		});

	}

}