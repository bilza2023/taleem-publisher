///home/bilal-tariq/00--TALEEM/taleem-server/src/serverKernel/Auth.js

import JWT from "./JWT.js";

export default class Auth {

	constructor(kernel) {
		this.kernel = kernel;
		this.jwt = new JWT(kernel);
	}
	// --------------------------------------------------
	// Token Creation
	// --------------------------------------------------
	createUserToken(user) {

		return this.jwt.sign({ id: user.id, type: "user" });

	}

	createAdminToken(admin) {

		return this.jwt.sign({ id: admin.id, type: "admin" });

	}

	// --------------------------------------------------
	// Authentication
	// --------------------------------------------------

	async authenticate(token) {

		const { id, type } = this.verifyToken(token);

		if (type === "user") return this.authenticateUser(id);

		if (type === "admin") return this.authenticateAdmin(id);

		this.fail("authenticate()", `Unknown identity type '${type}'.`);

	}

async authenticateUser(id) {

	const user = await this.kernel.user.get(id);

	if (!user)
		this.fail(
			"authenticateUser()",
			`User '${id}' does not exist.`
		);

	return user;

}

async authenticateAdmin(id) {

	const admin = await this.kernel.admin.get(id);

	if (!admin)
		this.fail(
			"authenticateAdmin()",
			`Admin '${id}' does not exist.`
		);

	return admin;

}

	verifyToken(token) {

		try {

			return this.jwt.verify(token);

		}
		catch (error) {

			this.fail("verifyToken()", error.message);

		}

	}

	// --------------------------------------------------
	// Helpers
	// --------------------------------------------------

	fail(method, reason) {

		throw new Error(
			[
				"",
				"========================================",
				"AUTHENTICATION FAILED",
				"----------------------------------------",
				`Method : Auth.${method}`,
				`Reason : ${reason}`,
				"========================================"
			].join("\n")
		);

	}

}