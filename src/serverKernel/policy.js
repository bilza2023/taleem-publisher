
// /home/bilal-tariq/00--TALEEM/taleem-server-prod/src/serverKernel/policy.js

import Resources from "./enums/Resources.js";

export default class Policy {

	constructor(kernel) {
		this.kernel = kernel;
	}

	// --------------------------------------------------
	// Require a resource for an admin on a course.
	// --------------------------------------------------

	async require(admin, courseId, resource) {

		if (!Object.values(Resources).includes(resource)) {

			throw new Error(
				`Policy.require(): Unknown resource '${resource}'.`
			);

		}

		const policy =
			await this.kernel.db.adminCoursePolicy.findUnique({

				where: {
					adminId_courseId: {
						adminId: admin.id,
						courseId
					}
				}

			});

		if (!policy) {

			throw new Error(
				`Policy.require(): Admin '${admin.email}' has no policy for course '${courseId}'.`
			);

		}

		if (!policy[resource]) {

			throw new Error(
				`Policy.require(): Resource '${resource}' denied for admin '${admin.email}' on course '${courseId}'.`
			);

		}

		return policy;

	}

	async listCourses(admin) {

	return await this.kernel.db.course.findMany({

		where: {

			adminPolicies: {

				some: {

					adminId: admin.id

				}

			}

		},

		orderBy: {

			title: "asc"

		}

	});

}
}