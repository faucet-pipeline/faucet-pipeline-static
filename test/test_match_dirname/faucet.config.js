import { resolve } from "node:path";

const config = [{
	source: "./src",
	target: "./dist",
	filter: path => path.startsWith("inner/")
}];
export { config as static };

export const plugins = [resolve(import.meta.dirname, "../..")];
