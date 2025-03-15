import { resolve } from "node:path";

const config = [{
	source: "./src.txt",
	target: "./dist/dist.txt"
}];
export { config as static };

export const plugins = [resolve(import.meta.dirname, "../..")];
