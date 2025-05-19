import { readdir, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Creates a processor for a single configuration
 *
 * @param {string} source - the source folder or file for this pipeline
 * @param {string} target - the target folder or file for this pipeline
 * @param {ProcessFile} processFile - process a single file
 * @param {AssetManager} assetManager
 * @param {Filter} [filter] - optional filter based on filenames
 * @returns {FaucetPluginFunc}
 */
export function buildProcessPipeline(source, target, processFile, assetManager, filter) {
	source = assetManager.resolvePath(source);
	target = assetManager.resolvePath(target, {
		enforceRelative: true
	});
	let fileFinder = new FileFinder(source, {
		skipDotfiles: true,
		filter
	});

	return async filepaths => {
		let [filenames, targetDir] = await Promise.all([
			(filepaths ? fileFinder.match(filepaths) : fileFinder.all()),
			determineTargetDir(source, target)
		]);

		return Promise.all(filenames.map(filename => processFile(filename, {
			assetManager, source, target, targetDir
		})));
	};
}

/**
 * If `source` is a directory, `target` is used as target directory -
 * otherwise, `target`'s parent directory is used
 *
 * @param {string} source
 * @param {string} target
 * @returns {Promise<string>}
 */
async function determineTargetDir(source, target) {
	let results = await stat(source);
	return results.isDirectory() ? target : path.dirname(target);
}

class FileFinder {
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
	 * A list of relative file paths within the respective directory
	 *
	 * @returns {Promise<string[]>}
	 */
	async all() {
		let filenames = await tree(this._root);
		return filenames.filter(this._filter);
	}

	/**
	 * All file paths that match the filter function
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
 * Flat list of all files of a directory tree
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

/**
 * @import {
 *     Filter,
 *     FileFinderOptions,
 *     ProcessFile
 * } from "./types.ts"
 *
 * @import {
 *     AssetManager,
 *     FaucetPluginFunc,
 * } from "faucet-pipeline-core/lib/types.ts"
*/
