let path = require("path");
let { createFile, generateFingerprint } = require("faucet-pipeline-util");
let { readFile } = require("./promisified-fs");
let tree = require("./tree");

module.exports = config => {
	return files => {
		let filesToCopy;

		if(files) {
			filesToCopy = filesWithinDirectory(config.source, files);
		} else {
			filesToCopy = tree(config.source);
		}

		return filesToCopy.
			then(files => files.filter(file => !file.startsWith("."))).
			then(sources => processFiles(sources, config));
	};
};

function processFiles(fileNames, config) {
	return Promise.all(fileNames.map(fileName => processFile(fileName, config)));
}

function processFile(fileName, { source, target, fingerprint, configDir }) {
	let sourcePath = path.join(source, fileName);
	let targetPath = path.join(target, fileName);
	let outputPath = targetPath;

	return readFile(sourcePath).
		then(content => {
			if(fingerprint) {
				outputPath = path.join(target, generateFingerprint(fileName, content));
			}

			return createFile(outputPath, content);
		}).
		then(_ => ({
			changed: true,
			target: path.relative(configDir, targetPath),
			output: path.relative(configDir, outputPath),
			filePath: path.relative(target, outputPath)
		}));
}

function filesWithinDirectory(directory, files) {
	return new Promise(resolve => {
		resolve(files.
			map(file => path.relative(directory, file)).
			filter(file => !file.startsWith("..")));
	});
}
