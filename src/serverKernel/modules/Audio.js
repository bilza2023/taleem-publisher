// src/serverKernel/modules/Audio.js

export default class Audio {

	constructor(kernel) {
		this.kernel = kernel;
	}

	// --------------------------------------------------
	// Queries
	// --------------------------------------------------

	async list() {

		return this.kernel.db.audio.findMany({

			orderBy: {
				createdAt: "desc"
			}

		});

	}

	async get(id) {

		return this.kernel.db.audio.findUnique({

			where: { id }

		});

	}

	// --------------------------------------------------
	// Create
	// --------------------------------------------------

	async create(data) {

		return this.kernel.db.audio.create({

			data

		});

	}

}