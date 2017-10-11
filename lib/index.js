let buildConfig = require("./build-config");
let fs = require("fs");
let path = require("path");
let { createFile } = require("faucet-pipeline-util");

module.exports = (rawConfig, configDir, { watcher, fingerprint }) => {
	let config = buildConfig(rawConfig, configDir, fingerprint);
	let bundleAll = buildBundleAll(config);

	// Run once for all files
	bundleAll();

	if(watcher) {
		watcher.on("edit", bundleAll);
	}
};

function buildBundleAll(config) {
	// TODO: Only copy changed files
	return _ => {
		config.bundles.forEach(bundle => {
			fs.readdir(bundle.source, (err, sources) => {
				// TODO: Error Handling
				if(err) {
					console.error(err);
					return;
				}

				sources.forEach(filePath => {
					fs.readFile(path.join(bundle.source, filePath), (err, content) => {
						// TODO: Error Handling
						if(err) {
							console.error(err);
							return;
						}

						// TODO: Fingerprint
						createFile(path.join(bundle.target, filePath), content);
					});
				});
			});
			// TODO: Manifest
			// TODO: Reporter
		});
	};
}
