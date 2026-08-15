// src/serverKernel/Config.js

import dotenv from "dotenv";

dotenv.config();

export default class Config {

	constructor() {

		this.port = Number(
			process.env.PORT ?? 9000
		);

		this.jwtSecret =
			process.env.JWT_SECRET;

		this.databaseUrl =
			process.env.DATABASE_URL;

		this.nodeEnv =
			process.env.NODE_ENV ?? "development";

	}

}