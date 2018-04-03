let path = require("path");
let { promisify } = require("faucet-pipeline/lib/util");
let FileFinder = require("faucet-pipeline/lib/util/files/finder");

let readFile = promisify(require("fs").readFile);
let stat = promisify(require("fs").stat);

module.exports = (pluginConfig, assetManager, { watcher }) => {
	buildCopyAll(pluginConfig, assetManager).
		then(copyAll => {
			// Run once for all files
			copyAll();

			if(watcher) {
				watcher.on("edit", copyAll);
			}
		});
};

function buildCopyAll(copyConfigs, assetManager) {
	let futureCopiers = copyConfigs.map(copyConfig =>
		buildCopier(copyConfig, assetManager));

	return Promise.all(futureCopiers).then(copiers => {
		return files => copiers.forEach(copier => copier(files));
	});
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

	return stat(source).then(results => {
		// If `source` is a directory, `target` is used as target directory -
		// otherwise, `target`'s parent directory is used
		return results.isDirectory() ? target : path.dirname(target);
	}).then(targetDir => {
		return files => {
			(files ? fileFinder.match(files) : fileFinder.all()).
				then(fileNames => processFiles(fileNames, {
					assetManager, source, target, targetDir
				}));
		};
	});
}

function processFiles(fileNames, config) {
	return Promise.all(fileNames.map(fileName => processFile(fileName, config)));
}

function processFile(fileName, { source, target, targetDir, assetManager }) {
	let sourcePath = path.join(source, fileName);
	let targetPath = path.join(target, fileName);

	return readFile(sourcePath).
		then(content => assetManager.writeFile(targetPath, content, {
			targetDir
		}));
}
