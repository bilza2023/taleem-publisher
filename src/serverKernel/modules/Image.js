
export default class Image {

	constructor(kernel) {
		this.kernel = kernel;
	}

	// --------------------------------------------------
	// Queries
	// --------------------------------------------------

	async list() {

		return this.kernel.db.image.findMany({

			orderBy: {
				createdAt: "desc"
			}

		});

	}

	async get(id) {

		return this.kernel.db.image.findUnique({

			where: { id }

		});

	}

	// --------------------------------------------------
	// Create
	// --------------------------------------------------

	async create(data) {

		return this.kernel.db.image.create({

			data

		});

	}

}