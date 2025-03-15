import { resolve } from "node:path";

const config = [{
	source: "./src",
	target: "./dist",
	filter: path => !path.endsWith("/test2.txt")
}];
export { config as static };

export const plugins = [resolve(import.meta.dirname, "../..")];
