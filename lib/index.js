let matcher = require("matcher");
let path = require("path");
let { readFile, stat } = require("./promisified-fs");
let tree = require("./tree");

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

	return stat(source).then(results => {
		// If `source` is a directory, `target` is used as target directory -
		// otherwise, `target`'s parent directory is used
		return results.isDirectory() ? target : path.dirname(target);
	}).then(targetDir => {
		return files => {
			return determineFilesToProcess(source, files).
				then(filterInvisibleFiles).
				then(selectFilesMatching(copyConfig.match)).
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

function selectFilesMatching(pattern) {
	let patterns = asArray(pattern);
	return files => matcher(files, patterns);
}

function asArray(value) {
	if(Array.isArray(value)) {
		return value;
	}

	return value ? [value] : [];
}

function filesWithinDirectory(directory, files) {
	return new Promise(resolve => {
		resolve(files.
			map(file => path.relative(directory, file)).
			filter(file => !file.startsWith("..")));
	});
}
