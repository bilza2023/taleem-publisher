import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function sqlAdoptor(data) {

	const courseSlug = data.course.slug;

	await prisma.$transaction(async tx => {

		await tx.library.deleteMany({
			where: { courseSlug }
		});

		await tx.course.deleteMany({
			where: { slug: courseSlug }
		});

		await tx.course.create({
			data: {
				slug: data.course.slug,
				title: data.course.title,
				description: data.course.description,
				thumbnail: data.course.thumbnail,
				groupings: JSON.stringify(
					data.course.groupings || []
				)
			}
		});

		for (const item of data.library) {

			const grouping = data.course.groupings.find(
				group => group.items.includes(item.slug)
			);

			if (!grouping) {
				throw new Error(
					`Library item "${item.slug}" has no grouping`
				);
			}

			await tx.library.create({
				data: {
					...item,
					courseSlug,
					groupSlug: grouping.slug
				}
			});
		}

	});

	return true;
}