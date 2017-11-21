let path = require("path");
let { readdir, stat } = require("./promisified-fs");

function tree(target, relativeTo = target) {
	return stat(target).then(results => {
		if(results.isDirectory()) {
			return readdir(target).then(entries => {
				return Promise.all(entries.map(entry => {
					return tree(path.join(target, entry), relativeTo);
				})).then(flatten);
			});
		} else {
			return [ path.relative(relativeTo, target) ];
		}
	});
}

function flatten(arr) {
	return [].concat.apply([], arr);
}

module.exports = tree;
