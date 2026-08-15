// src/serverKernel/CommunicationPolicy.js

export default class CommunicationPolicy {

	constructor(kernel) {
		this.kernel = kernel;
	}

	// --------------------------------------------------
	// Require permission to create a new communication.
	// --------------------------------------------------

	async require(user) {

		const MAX_OPEN_QUESTIONS = 5;

		const count =
			await this.kernel.communication.countUserOpenQuestions(
				user.id
			);

		if (count >= MAX_OPEN_QUESTIONS) {

			throw new Error(
				`Maximum of ${MAX_OPEN_QUESTIONS} open questions reached.`
			);

		}

		return true;

	}

}