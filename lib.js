let { readdir, stat } = require("node:fs/promises");
let path = require("node:path");
/** @import { FileFinderOptions } from "./types.ts" */

exports.FileFinder = class FileFinder {
	/**
	 * @param {string} directory
	 * @param {FileFinderOptions} options?
	 */
	constructor(directory, { skipDotfiles, filter = () => true } = {}) {
		this.directory = directory;
		/**
		 * @param {string} filename
		 * @return {boolean}
		 */
		this.filter = filename => {
			if(skipDotfiles && isDotfile(filename)) {
				return false;
			}
			return filter(filename);
		};
	}

	/**
	 * a list of relative file paths within the respective directory
	 *
	 * @returns {Promise<string[]>}
	 */
	all() {
		return tree(this.directory).
			then(filenames => filenames.filter(this.filter));
	}

	/**
	 * all file paths that match the filter function
	 *
	 * @param {string[]} filepaths
	 * @returns {Promise<string[]>}
	 */
	match(filepaths) {
		return filesWithinDirectory(this.directory, filepaths).
			then(filepaths => filepaths.filter(this.filter));
	}
};

/**
 * @param {string} filepath
 * @param {string} referenceDir
 * @returns {Promise<string[]>}
 */
function tree(filepath, referenceDir = filepath) {
	return stat(filepath).
		then(res => {
			if(!res.isDirectory()) {
				return [path.relative(referenceDir, filepath)];
			}

			return readdir(filepath).
				then(entries => {
					let res = Promise.all(entries.map(entry => {
						return tree(path.join(filepath, entry), referenceDir);
					}));
					return res.then(flatten);
				});
		});
}

/**
 * @param {string} directory
 * @param {string[]} files
 * @returns {Promise<string[]>}
 */
function filesWithinDirectory(directory, files) {
	return new Promise(resolve => {
		resolve(files.
			map(filepath => path.relative(directory, filepath)).
			filter(filename => !filename.startsWith("..")));
	});
}

/**
 * @param {string} filename
 * @returns {boolean}
 */
function isDotfile(filename) {
	return path.basename(filename).startsWith(".");
}

/**
 * @param {string[][]} arr
 * @returns {string[]}
 */
function flatten(arr) {
	/**
	 * I'm deeply sorry for this
	 * @type string[]
	 */
	const akwardlyTypedStringArray = [];
	return akwardlyTypedStringArray.concat.apply([], arr);
}
