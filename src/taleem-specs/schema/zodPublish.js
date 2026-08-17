
import { z } from "zod";
import { LiberayItemType } from "../enums/LiberayItemType.js";

const PublishGroupingSchema = z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    thumbnail: z.string().optional(),
    sortOrder: z.number().int().nonnegative(),
    items: z.array(z.string().min(1))
});

const PublishCourseSchema = z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    groupings: z.array(PublishGroupingSchema)
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
    library: z.array(PublishLibraryItemSchema)
});

export default PublishSchema;