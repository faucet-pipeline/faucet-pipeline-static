"use strict";

module.exports = {
	static: {
		manifest: {
			file: "./dist/manifest.json",
			baseURI: "/assets"
		},
		bundles: [{
			source: "src",
			target: "dist"
		}]
	}
};
