let path = require("path");
let { uriJoin } = require("faucet-pipeline-util");

// Create the configuration object
//
// Combines the CLI parameters with the config file
// TODO: Check if the config is well formed
module.exports = (config, configDir, fingerprint, compact) => {
	return {
		bundles: translateBundlerConfigs(config.bundles, {
			configDir, fingerprint
		}),
		manifest: translateManifestConfig(config.manifest, { configDir })
	};
};

function translateBundlerConfigs(bundleConfigs, options) {
	let { configDir, fingerprint } = options;

	return bundleConfigs.map(bundleConfig => {
		let source = path.resolve(configDir, bundleConfig.source);
		let target = path.resolve(configDir, bundleConfig.target);

		return {
			fingerprint,
			source,
			target
		};
	});
}

function translateManifestConfig(manifestConfig, { configDir }) {
	if(manifestConfig === false) {
		return false;
	}

	let baseURI;
	if(manifestConfig.baseURI.call) {
		baseURI = manifestConfig.baseURI;
	} else {
		baseURI = bundlePath => uriJoin(manifestConfig.baseURI, bundlePath);
	}

	return {
		file: path.resolve(configDir, manifestConfig.file),
		baseURI: baseURI
	};
}
