import { buildProcessPipeline } from "./util.js";
import { readFile } from "node:fs/promises";
import * as path from "node:path";

export const key = "static";
export const bucket = "static";

/** @type FaucetPlugin<Config> */
export function plugin(config, assetManager, options) {
	let pipeline = config.map(copyConfig => {
		let processFile = buildProcessFile(copyConfig, options);
		let { source, target, filter } = copyConfig;
		return buildProcessPipeline(source, target, processFile, assetManager, filter);
	});

	return filepaths => Promise.all(pipeline.map(copy => copy(filepaths)));
}

/**
 * Returns a function that copies a single file with optional compactor
 *
 * @param {Config} copyConfig
 * @param {FaucetPluginOptions} options
 * @returns {ProcessFile}
 */
function buildProcessFile(copyConfig, options) {
	let compactors = (options.compact && copyConfig.compact) || {};

	return async function(filename,
			{ source, target, targetDir, assetManager }) {
		let sourcePath = path.join(source, filename);
		let targetPath = path.join(target, filename);
		let content;

		try {
			content = await readFile(sourcePath);
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
		if(copyConfig.fingerprint !== undefined) {
			options.fingerprint = copyConfig.fingerprint;
		}
		return assetManager.writeFile(targetPath, content, options);
	};
}

/** @import {
  *   Config,
	*   FaucetPlugin,
	*   FaucetPluginOptions,
	*   WriteFileOpts,
	*   ProcessFile
	*   } from "./types.ts"
	**/
