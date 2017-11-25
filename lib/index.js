let path = require("path");
let { readFile } = require("./promisified-fs");
let tree = require("./tree");

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
	let source = assetManager.resolvePath(copyConfig.source, {
		enforceRelative: true
	});
	let target = assetManager.resolvePath(copyConfig.target, {
		enforceRelative: true
	});

	return files => {
		return determineFilesToProcess(source, files).
			then(filterInvisibleFiles).
			then(fileNames => processFiles(fileNames, {
				assetManager, source, target
			}));
	};
}

function processFiles(fileNames, config) {
	return Promise.all(fileNames.map(fileName => processFile(fileName, config)));
}

function processFile(fileName, { source, target, assetManager }) {
	let sourcePath = path.join(source, fileName);
	let targetPath = path.join(target, fileName);

	return readFile(sourcePath).
		then(content => assetManager.writeFile(targetPath, content, {
			targetDir: target
		}));
}

function determineFilesToProcess(source, files) {
	if(files) {
		return filesWithinDirectory(source, files);
	} else {
		return tree(source);
	}
}

function filterInvisibleFiles(files) {
	return files.filter(file => !file.startsWith("."));
}

function filesWithinDirectory(directory, files) {
	return new Promise(resolve => {
		resolve(files.
			map(file => path.relative(directory, file)).
			filter(file => !file.startsWith("..")));
	});
}
