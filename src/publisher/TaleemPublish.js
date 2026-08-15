import fs from "fs";
import path from "path";
import PublishSchema from "../taleem-specs/schema/zodPublish.js";
import loadCourse from "./componenets/loadCourse.js";
import compileItem from "./componenets/compileItem.js";
import trimSyllabus from "./componenets/trimSyllabus.js";

export default class TaleemPublish {

	constructor(courseName) {
		if (!courseName) throw new Error("Course name is required");

		this.trimSyllabus = true;
		this.checkDecks = false;
		this.courseName = courseName;

		this.courseFile = path.resolve(
			"courses",
			courseName,
			`${courseName}.json`
		);

		this.contentDir = path.resolve(
			"content",
			courseName
		);

		this.course = null;
	}

	async publish() {

		this.course = loadCourse(
			this.courseFile,
			this.contentDir
		);

		const compiled = {
			course: {
				slug: this.course.slug,
				title: this.course.title,
				description: this.course.description,
				thumbnail: this.course.thumbnail
			},
			groupings: [],
			library: []
		};

		for (
			let i = 0;
			i < (this.course.groupings || []).length;
			i++
		) {

			const grouping = this.course.groupings[i];
			const groupingDir = path.join(
				this.contentDir,
				grouping.slug
			);

			const syllabus = grouping.items || [];
			const library = [];

			for (
				let j = 0;
				j < syllabus.length;
				j++
			) {

				const item = compileItem({
					slug: syllabus[j],
					grouping,
					groupingDir,
					course: this.course,
					sortOrder: j + 1
				});

				if (item) library.push(item);
			}

			compiled.groupings.push({
				slug: grouping.slug,
				title: grouping.title,
				thumbnail: grouping.thumbnail,
				sortOrder: i + 1,
				items: this.trimSyllabus
					? trimSyllabus(syllabus, library)
					: syllabus
			});

			compiled.library.push(...library);
		}

		return PublishSchema.parse(compiled);
	}
}