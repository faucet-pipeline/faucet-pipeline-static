let path = require("path");
let { readdir, stat } = require("./promisified-fs");

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
