// src/serverKernel/JWT.js

import jwt from "jsonwebtoken";

export default class JWT {

	constructor(kernel) {

		this.kernel = kernel;

	}

	sign(payload) {

		return jwt.sign(
			payload,
			this.kernel.config.jwtSecret
		);

	}

	verify(token) {

		return jwt.verify(
			token,
			this.kernel.config.jwtSecret
		);

	}

}