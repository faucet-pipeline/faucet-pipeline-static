let fs = require("fs");
let path = require("path");
let { createFile, generateFingerprint } = require("faucet-pipeline-util");
// TODO: Not available on all supported Node versions
let { promisify } = require("util");
let readFile = promisify(fs.readFile);
let readdir = promisify(fs.readdir);

module.exports = ({ source, target, fingerprint, configDir }) => {
	// TODO: Only copy changed files
	return _ => {
		return readdir(source).then(sources => {
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
