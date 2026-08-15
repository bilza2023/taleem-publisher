// src/serverKernel/modules/Subscription.js

export default class Subscription {

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

		if (filters.courseId) {
			where.courseId = filters.courseId;
		}

		return this.kernel.db.subscription.findMany({
			where
		});

	}

	async get(id) {

		return this.kernel.db.subscription.findUnique({
			where: { id }
		});

	}

	// --------------------------------------------------
	// CRUD
	// --------------------------------------------------

	async create(data) {

		return this.kernel.db.subscription.create({
			data
		});

	}

	async update(id, data) {

		return this.kernel.db.subscription.update({
			where: { id },
			data
		});

	}

	async delete(id) {

		return this.kernel.db.subscription.delete({
			where: { id }
		});

	}

	// --------------------------------------------------
	// Utilities
	// --------------------------------------------------

	async authorize(userId, courseId) {
  debugger;
		const now = new Date();

		const subscription = await this.kernel.db.subscription.findFirst({

			where: {
				userId,
				courseId,
				startsAt: { lte: now },
				endsAt: { gte: now }
			}

		});

		if (!subscription) {
			throw new Error(
				`User "${userId}" does not have an active subscription for course "${courseId}".`
			);
		}

		return subscription;

	}

}