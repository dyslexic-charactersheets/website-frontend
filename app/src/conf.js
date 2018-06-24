const fs = require('fs');
const _ = require('lodash');
const yaml = require('js-yaml');

// config
// load config from a YAML file

var config = {};

fs.readFile('../data/config.yml', (err, data) => {
    if (err) throw err;
    config = yaml.safeLoad(data);
});

module.exports = function (key) {
	if (_.has(config, key))
		return config[key];
	return null;
};
