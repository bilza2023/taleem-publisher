
import TaleemPublish from "../src/publisher/TaleemPublish.js";

const publisher = new TaleemPublish("fbise9math");

const compiled = await publisher.publish();

console.dir(compiled, {
	depth: null,
	colors: true
});