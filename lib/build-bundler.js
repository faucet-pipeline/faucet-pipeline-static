let path = require("path");
let { createFile, generateFingerprint } = require("faucet-pipeline-util");
let { readFile } = require("./promisified-fs");
let tree = require("./tree");

module.exports = ({ source, target, fingerprint, configDir }) => {
	return files => {
		let filesToCopy;

		if(files) {
			filesToCopy = filesWithinDirectory(source, files);
		} else {
			filesToCopy = tree(source);
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
