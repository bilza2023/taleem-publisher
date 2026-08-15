// src/serverKernel/modules/User.js

import bcrypt from "bcrypt";

export default class User {

	constructor(kernel) {
		this.kernel = kernel;
	}

	// --------------------------------------------------
	// Queries
	// --------------------------------------------------

	async list() {

		return this.kernel.db.user.findMany();

	}

	async get(id) {

		return this.kernel.db.user.findUnique({
			where: { id }
		});

	}

	async getByEmail(email) {

		return this.kernel.db.user.findUnique({
			where: { email }
		});

	}

	async emailToId(email) {

	const user = await this.getByEmail(email);

	if (!user) {
		throw new Error(`User '${email}' not found.`);
	}

	return user.id;

}
	// --------------------------------------------------
	// Authentication
	// --------------------------------------------------

	async register(data) {

		const password = await bcrypt.hash(data.password, 10);

		return this.kernel.db.user.create({

			data: {
				...data,
				password
			}

		});

	}

	async login(email, password) {

		const user = await this.getByEmail(email);

		if (!user) {
			throw new Error(`User.login(): User '${email}' not found.`);
		}

		const ok = await bcrypt.compare(password, user.password);

		if (!ok) {
			throw new Error(`User.login(): Invalid password.`);
		}

		return this.kernel.auth.createUserToken(user);

	}

	// --------------------------------------------------
	// CRUD
	// --------------------------------------------------

	async update(id, data) {

		if (data.password) {

			data.password = await bcrypt.hash(data.password, 10);

		}

		return this.kernel.db.user.update({

			where: { id },

			data

		});

	}

	async delete(id) {

		return this.kernel.db.user.delete({

			where: { id }

		});

	}

}