let fs = require("fs");
let path = require("path");
let { createFile, generateFingerprint } = require("faucet-pipeline-util");
// TODO: Not available on all supported Node versions
let { promisify } = require("util");
let readFile = promisify(fs.readFile);
let readdir = promisify(fs.readdir);

module.exports = ({ source, target, fingerprint, configDir }) => {
	return files => {
		let filesToCopy;

		if(files) {
			filesToCopy = filesWithinDirectory(source, files);
		} else {
			// TODO: Get that entire tree
			filesToCopy = readdir(source);
		}

		return filesToCopy.then(sources => {
			return Promise.all(sources.map(fileName => {
				let sourcePath = path.join(source, fileName);

				return readFile(sourcePath).then(content => {
					if(fingerprint) {
						fileName = generateFingerprint(fileName, content);
					}

					let targetPath = path.join(target, fileName);

					return createFile(targetPath, content).then(_ => {
						return {
							changed: true,
							target: path.relative(configDir, sourcePath),
							output: path.relative(configDir, targetPath)
						};
					});
				});
			}));
		});
	};
};

function filesWithinDirectory(directory, files) {
	return new Promise(resolve => {
		resolve(files.
			map(file => path.relative(directory, file)).
			filter(file => !file.startsWith("..")));
	});
}
