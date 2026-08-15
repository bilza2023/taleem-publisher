
import { z } from "zod";
import { LiberayItemType } from "../enums/LiberayItemType.js";

const PublishCourseSchema = z.object({
	slug: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional(),
	thumbnail: z.string().optional()
});

const PublishGroupingSchema = z.object({
	slug: z.string().min(1),
	title: z.string().min(1),
	thumbnail: z.string().optional(),
	sortOrder: z.number().int().nonnegative(),
	items: z.array(z.string().min(1))
});

const PublishLibraryItemSchema = z.object({
	slug: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional(),
	thumbnail: z.string().optional(),
	type: z.enum([
		LiberayItemType.ARTICLE,
		LiberayItemType.PLAYER
	]),
	body: z.string(),
	sortOrder: z.number().int().nonnegative()
});

const PublishSchema = z.object({
	course: PublishCourseSchema,
	groupings: z.array(PublishGroupingSchema),
	library: z.array(PublishLibraryItemSchema)
});

export default PublishSchema;