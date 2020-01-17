let path = require("path");
let { promisify } = require("faucet-pipeline-core/lib/util");
let FileFinder = require("faucet-pipeline-core/lib/util/files/finder");

let readFile = promisify(require("fs").readFile);
let stat = promisify(require("fs").stat);

module.exports = {
	key: "static",
	bucket: "static",
	plugin: faucetStatic
};

function faucetStatic(config, assetManager, { compact } = {}) {
	let copiers = config.map(copyConfig =>
		makeCopier(copyConfig, assetManager, { compact }));

	return filepaths => Promise.all(copiers.map(copy => copy(filepaths)));
}

function makeCopier(copyConfig, assetManager, { compact } = {}) {
	let source = assetManager.resolvePath(copyConfig.source);
	let target = assetManager.resolvePath(copyConfig.target, {
		enforceRelative: true
	});
	let fileFinder = new FileFinder(source, {
		skipDotfiles: true,
		filter: copyConfig.filter
	});
	let { fingerprint } = copyConfig;
	let plugins = determinePlugins(compact, copyConfig);

	return filepaths => {
		return Promise.all([
			(filepaths ? fileFinder.match(filepaths) : fileFinder.all()),
			determineTargetDir(source, target)
		]).then(([fileNames, targetDir]) => {
			return processFiles(fileNames, {
				assetManager, source, target, targetDir, plugins, fingerprint
			});
		});
	};
}

function determinePlugins(compact, copyConfig) {
	if(!compact) {
		return {};
	}

	if(copyConfig.compact === "images") {
		return {
			jpg: require("imagemin-mozjpeg")({ quality: 80 }),
			png: require("imagemin-pngquant")(),
			svg: require("imagemin-svgo")()
		};
	}

	return copyConfig.compact || {};
}

// If `source` is a directory, `target` is used as target directory -
// otherwise, `target`'s parent directory is used
function determineTargetDir(source, target) {
	return stat(source).
		then(results => results.isDirectory() ? target : path.dirname(target));
}

function processFiles(fileNames, config) {
	return Promise.all(fileNames.map(fileName => processFile(fileName, config)));
}

function processFile(fileName,
		{ source, target, targetDir, fingerprint, assetManager, plugins }) {
	let sourcePath = path.join(source, fileName);
	let targetPath = path.join(target, fileName);

	return readFile(sourcePath).
		then(content => {
			let type = determineFileType(sourcePath);
			let plugin = type && plugins[type];
			return plugin ? plugin(content) : content;
		}).
		then(content => {
			let options = { targetDir };
			if(fingerprint !== undefined) {
				options.fingerprint = fingerprint;
			}
			return assetManager.writeFile(targetPath, content, options);
		});
}

function determineFileType(sourcePath) {
	return path.extname(sourcePath).substr(1).toLowerCase();
}
