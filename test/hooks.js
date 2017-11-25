// monkey-patches faucet-pipeline to `require` local repository as faucet-pipeline-js
"use strict";

let hook = require("node-hook");
let path = require("path");

let faucetStatic = path.resolve(__dirname, "..");

hook.hook(".js", (src, name) => {
	if(/\/faucet-pipeline\/lib\/index.js$/.test(name)) {
		return src.replace("faucet-pipeline-static", faucetStatic);
	}

	return src;
});
