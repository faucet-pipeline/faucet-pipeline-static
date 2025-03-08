let { readFile, stat } = require("node:fs/promises");
let path = require("node:path");
let { FileFinder } = require("./lib.js");
/** @import {
  *   Config,
	*   AssetManager,
	*   FaucetPlugin,
	*   FaucetPluginOptions,
	*   FaucetPluginFunc,
	*   CompactorMap,
	*   WriteFileOpts,
	*   ProcessFile
	*   } from "./types.ts"
	**/

module.exports = {
	key: "static",
	bucket: "static",
	plugin: faucetStatic
};

/**
 * The static plugin copies files with an option to define compaction functions
 *
 * @type FaucetPlugin<Config>
 */
function faucetStatic(config, assetManager, { compact } = {}) {
	let copiers = config.map(copyConfig =>
		makeCopier(copyConfig, assetManager, { compact }));

	return filepaths => Promise.all(copiers.map(copy => copy(filepaths)));
}

/**
 * Create a copier for a single configuration
 *
 * @param {Config} copyConfig
 * @param {AssetManager} assetManager
 * @param {FaucetPluginOptions} options
 * @returns {FaucetPluginFunc}
 */
function makeCopier(copyConfig, assetManager, { compact } = {}) {
	let source = assetManager.resolvePath(copyConfig.source);
	let target = assetManager.resolvePath(copyConfig.target, {
		enforceRelative: true
	});
	let fileFinder = new FileFinder(source, {
		skipDotfiles: true,
		filter: copyConfig.filter
	});
	let { fingerprint } = copyConfig;
	let compactors = determineCompactors(compact, copyConfig);

	return filepaths => {
		return Promise.all([
			(filepaths ? fileFinder.match(filepaths) : fileFinder.all()),
			determineTargetDir(source, target)
		]).then(([fileNames, targetDir]) => {
			return processFiles(fileNames, {
				assetManager, source, target, targetDir, compactors, fingerprint
			});
		});
	};
}

/**
 * Determine which compactors should be used
 *
 * @param {boolean | undefined} compact
 * @param {Config} copyConfig
 * @returns {CompactorMap}
 */
function determineCompactors(compact, copyConfig) {
	if(!compact) {
		return {};
	}

	return copyConfig.compact || {};
}

/**
 * If `source` is a directory, `target` is used as target directory -
 * otherwise, `target`'s parent directory is used
 *
 * @param {string} source
 * @param {string} target
 * @returns {Promise<string>}
 */
function determineTargetDir(source, target) {
	return stat(source).
		then(results => results.isDirectory() ? target : path.dirname(target));
}

/**
 * @param {string[]} fileNames
 * @param {ProcessFile} config
 * @returns {Promise<unknown>}
 */
function processFiles(fileNames, config) {
	return Promise.all(fileNames.map(fileName => processFile(fileName, config)));
}

/**
 * @param {string} fileName
 * @param {ProcessFile} opts
 * @returns {Promise<unknown>}
 */
async function processFile(fileName,
		{ source, target, targetDir, fingerprint, assetManager, compactors }) {
	let sourcePath = path.join(source, fileName);
	let targetPath = path.join(target, fileName);

	try {
		var content = await readFile(sourcePath); // eslint-disable-line no-var
	} catch(err) {
		// @ts-ignore
		if(err.code !== "ENOENT") {
			throw err;
		}
		console.error(`WARNING: \`${sourcePath}\` no longer exists`);
		return;
	}

	let type = determineFileType(sourcePath);
	if(type && compactors[type]) {
		let compactor = compactors[type];
		content = await compactor(content);
	}

	/**
	 * @type WriteFileOpts
	 */
	let options = { targetDir };
	if(fingerprint !== undefined) {
		options.fingerprint = fingerprint;
	}
	return assetManager.writeFile(targetPath, content, options);
}

/**
 * The filetype is the lower case file extension
 *
 * @param {string} sourcePath
 * @returns {string}
 */
function determineFileType(sourcePath) {
	return path.extname(sourcePath).substr(1).toLowerCase();
}
