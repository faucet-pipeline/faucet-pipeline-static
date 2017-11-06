let fs = require("fs");
let path = require("path");
// TODO: Not available on all supported Node versions
let { promisify } = require("util");
let stat = promisify(fs.stat);
let readdir = promisify(fs.readdir);

function tree(directory, relativeTo = directory) {
	return readdir(directory).then(entries => {
		return Promise.all(entries.map(entry => {
			let fullEntry = path.join(directory, entry);

			return stat(fullEntry).then(results => {
				if(results.isDirectory()) {
					return tree(fullEntry, relativeTo);
				} else {
					return path.relative(relativeTo, fullEntry);
				}
			});
		})).then(flatten);
	});
}

function flatten(arr) {
	return [].concat.apply([], arr);
}

module.exports = tree;
