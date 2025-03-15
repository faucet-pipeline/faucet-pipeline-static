import { resolve } from "node:path";

const config = [{
	source: "./src",
	target: "./dist"
}];
export { config as static };

export const plugins = [resolve(import.meta.dirname, "../..")];
