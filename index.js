let path = require("path");
let { promisify } = require("faucet-pipeline-core/lib/util");
let FileFinder = require("faucet-pipeline-core/lib/util/files/finder");

let readFile = promisify(require("fs").readFile);
let stat = promisify(require("fs").stat);

module.exports = (pluginConfig, assetManager, { watcher }) => {
	let copyAll = buildCopyAll(pluginConfig, assetManager);

	// Run once for all files
	copyAll();

	if(watcher) {
		watcher.on("edit", copyAll);
	}
};

function buildCopyAll(copyConfigs, assetManager) {
	let copiers = copyConfigs.map(copyConfig =>
		buildCopier(copyConfig, assetManager));

	return files => copiers.forEach(copier => copier(files));
}

function buildCopier(copyConfig, assetManager) {
	let source = assetManager.resolvePath(copyConfig.source);
	let target = assetManager.resolvePath(copyConfig.target, {
		enforceRelative: true
	});
	let fileFinder = new FileFinder(source, {
		skipDotfiles: true,
		filter: copyConfig.filter
	});

	let { fingerprint } = copyConfig;

	return files => {
		Promise.all([
			(files ? fileFinder.match(files) : fileFinder.all()),
			determineTargetDir(source, target)
		]).then(([fileNames, targetDir]) => {
			return processFiles(fileNames, {
				assetManager, source, target, targetDir, fingerprint
			});
		});
	};
}

// If `source` is a directory, `target` is used as target directory -
// otherwise, `target`'s parent directory is used
function determineTargetDir(source, target) {
	return stat(source).
		then(results => results.isDirectory() ? target : path.dirname(target));
}

function processFiles(fileNames, config) {
	return Promise.all(fileNames.map(fileName => processFile(fileName, config)));
}

function processFile(fileName,
		{ source, target, targetDir, fingerprint, assetManager }) {
	let sourcePath = path.join(source, fileName);
	let targetPath = path.join(target, fileName);

	return readFile(sourcePath).
		then(content => {
			let options = { targetDir };
			if(fingerprint !== undefined) {
				options.fingerprint = fingerprint;
			}
			return assetManager.writeFile(targetPath, content, options);
		});
}
