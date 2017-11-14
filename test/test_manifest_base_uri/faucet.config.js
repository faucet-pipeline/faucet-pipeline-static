"use strict";

module.exports = {
	static: {
		manifest: {
			file: "./dist/manifest.json",
			baseURI: (bundlePath, filePath) => `/assets/${filePath}`
		},
		bundles: [{
			source: "src",
			target: "dist"
		}]
	}
};
