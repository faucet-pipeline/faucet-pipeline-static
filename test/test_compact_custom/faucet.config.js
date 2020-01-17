"use strict";
let path = require("path");

module.exports = {
	static: [{
		source: "./src",
		target: "./dist",
		compact: {
			svg: require("imagemin-svgo")()
		}
	}],
	plugins: [path.resolve(__dirname, "../..")]
};
