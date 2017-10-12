// A reporter
//
// Reports the results of the run
module.exports = _ => {
	return results => {
		results.reduce((acc, cur) => acc.concat(cur)).forEach(res => {
			if(res.changed) {
				console.log(`✓ ${res.output}`); // eslint-disable-line no-console
			}
		});
	};
};
