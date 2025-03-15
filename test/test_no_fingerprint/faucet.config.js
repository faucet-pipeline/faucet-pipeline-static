import { resolve } from "node:path";

const config = [{
	source: "./src",
	target: "./dist/no-fingerprint",
	fingerprint: false
}, {
	source: "./src",
	target: "./dist/fingerprint"
}];
export { config as static };

export const plugins = [resolve(import.meta.dirname, "../..")];
