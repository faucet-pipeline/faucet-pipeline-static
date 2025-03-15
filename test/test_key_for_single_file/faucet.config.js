import { resolve, relative } from "node:path";

const config = [{
	source: "./src/test.txt",
	target: "./dist/test.txt"
}];
export { config as static };

export const manifest = {
	target: "./dist/manifest.json",
	key: (f, targetDir) => relative(targetDir, f)
};

export const plugins = [resolve(import.meta.dirname, "../..")];
