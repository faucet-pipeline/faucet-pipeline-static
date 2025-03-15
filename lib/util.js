import { readdir, stat } from "node:fs/promises";
import * as path from "node:path";

export class FileFinder {
	/**
	 * @param {string} root
	 * @param {FileFinderOptions} options
	 */
	constructor(root, { skipDotfiles, filter }) {
		this._root = root;

		/**
		 * @param {string} filename
		 * @return {boolean}
		 */
		this._filter = filename => {
			if(skipDotfiles && path.basename(filename).startsWith(".")) {
				return false;
			}
			return filter ? filter(filename) : true;
		};
	}

	/**
	 * a list of relative file paths within the respective directory
	 *
	 * @returns {Promise<string[]>}
	 */
	async all() {
		let filenames = await tree(this._root);
		return filenames.filter(this._filter);
	}

	/**
	 * all file paths that match the filter function
	 *
	 * @param {string[]} filepaths
	 * @returns {Promise<string[]>}
	 */
	async match(filepaths) {
		return filepaths.map(filepath => path.relative(this._root, filepath)).
			filter(filename => !filename.startsWith("..")).
			filter(this._filter);
	}
}

/**
 * flat list of all files of a directory tree
 *
 * @param {string} filepath
 * @param {string} referenceDir
 * @returns {Promise<string[]>}
 */
async function tree(filepath, referenceDir = filepath) {
	let stats = await stat(filepath);

	if(!stats.isDirectory()) {
		return [path.relative(referenceDir, filepath)];
	}

	let entries = await Promise.all((await readdir(filepath)).map(entry => {
		return tree(path.join(filepath, entry), referenceDir);
	}));
	return entries.flat();
}

/** @import { FileFinderOptions } from "./types.ts" */
