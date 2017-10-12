let buildConfig = require("./build-config");
let buildBundler = require("./build-bundler");
let buildReporter = require("./build-reporter");

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
	let bundlers = config.bundles.map(bundleConfig => buildBundler(bundleConfig));
	let report = buildReporter();

	return files => {
		Promise.all(bundlers.map(bundler => bundler(files))).then(report);
	};
	// TODO: Manifest
}
