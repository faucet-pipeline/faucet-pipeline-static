let fs = require("fs");
let path = require("path");
let { createFile, generateFingerprint } = require("faucet-pipeline-util");
// TODO: Not available on all supported Node versions
let { promisify } = require("util");
let readFile = promisify(fs.readFile);
let readdir = promisify(fs.readdir);

module.exports = ({ source, target, fingerprint }) => {
	// TODO: Only copy changed files
	return _ => {
		readdir(source).then(sources => {
			return Promise.all(sources.map(filePath => {
				let sourcePath = path.join(source, filePath);

				return readFile(sourcePath).then(content => {
					if(fingerprint) {
						filePath = generateFingerprint(filePath, content);
					}

					let targetPath = path.join(target, filePath);

					return createFile(targetPath, content);
				});
			}));
		});
	};
};
