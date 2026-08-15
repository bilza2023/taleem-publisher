// src/serverKernel/modules/Communication.js

export default class Communication {

	constructor(kernel) {
		this.kernel = kernel;
	}

	// --------------------------------------------------
	// Queries
	// --------------------------------------------------

	async list(filters = {}) {

		const where = {};

		if (filters.userId) {
			where.userId = filters.userId;
		}

		if (filters.libraryId) {
			where.libraryId = filters.libraryId;
		}

		return this.kernel.db.communication.findMany({
			where
		});

	}

	async get(id) {

		return this.kernel.db.communication.findUnique({

			where: { id },

			include: {

				library: {

					select: {

						id: true,
						title: true,

						course: {
							select: {
								id: true,
								title: true
							}
						}

					}

				}

			}

		});

	}

	// --------------------------------------------------
	// CRUD
	// --------------------------------------------------
async create(data) {

	try {
		// console.log("data",data);
		return await this.kernel.db.communication.create({
			data
		});

	}
	catch (error) {

		throw new Error(
			[
				"",
				"========================================",
				"COMMUNICATION CREATE FAILED",
				"----------------------------------------",
				`Reason : ${error.message}`,
				"========================================"
			].join("\n")
		);

	}

}

	async update(id, data) {

		return this.kernel.db.communication.update({
			where: { id },
			data
		});

	}

	async delete(id) {

		return this.kernel.db.communication.delete({
			where: { id }
		});

	}

	// --------------------------------------------------
	// Special Queries
	// --------------------------------------------------

async listUnanswered(courseId) {

	return this.kernel.db.communication.findMany({

		where: {

			OR: [
				{ authorResponse: null },
				{ authorResponse: "" }
			],

			library: {
				courseId
			}

		},

		include: {

			user: true,
			library: true

		}

	});

}


// --------------------------------------------------
// Count unanswered questions for one user.
// --------------------------------------------------

async countUserOpenQuestions(userId) {

	return this.kernel.db.communication.count({

		where: {

			userId,

			OR: [
				{ authorResponse: null },
				{ authorResponse: "" }
			]

		}

	});

}


}//