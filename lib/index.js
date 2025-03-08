let { FileFinder } = require("./util.js");
let { readFile, stat } = require("node:fs/promises");
let path = require("node:path");

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
	let compactors = (compact && copyConfig.compact) || {};

	return async filepaths => {
		let [filenames, targetDir] = await Promise.all([
			(filepaths ? fileFinder.match(filepaths) : fileFinder.all()),
			determineTargetDir(source, target)
		]);

		return Promise.all(filenames.map(filename => processFile(filename, {
			assetManager, source, target, targetDir, compactors, fingerprint
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

/**
 * @param {string} filename
 * @param {ProcessFile} opts
 * @returns {Promise<unknown>}
 */
async function processFile(filename,
		{ source, target, targetDir, fingerprint, assetManager, compactors }) {
	let sourcePath = path.join(source, filename);
	let targetPath = path.join(target, filename);

	try {
		var content = await readFile(sourcePath); // eslint-disable-line no-var
	} catch(err) {
		// @ts-expect-error TS2345
		if(err.code !== "ENOENT") {
			throw err;
		}
		console.error(`WARNING: \`${sourcePath}\` no longer exists`);
		return;
	}

	let fileExtension = path.extname(sourcePath).substr(1).toLowerCase();
	if(fileExtension && compactors[fileExtension]) {
		let compactor = compactors[fileExtension];
		content = await compactor(content);
	}

	/** @type WriteFileOpts */
	let options = { targetDir };
	if(fingerprint !== undefined) {
		options.fingerprint = fingerprint;
	}
	return assetManager.writeFile(targetPath, content, options);
}

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
