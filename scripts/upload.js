///home/bilal-tariq/00--TALEEM/taleem-library/scripts/upload.js
import fs from "fs";

const source = "/home/bilal-tariq/00--TALEEM/taleem-library/prisma/dev.db";
const target = "/home/bilal-tariq/00--TALEEM/taleem-server-prod/prisma/content.db";

fs.copyFileSync(source, target);

console.log("dev.db copied successfully.");