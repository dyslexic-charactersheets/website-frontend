const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const yaml = require('js-yaml');

// config
// load config from a YAML file

var config = {};

const configFile = path.normalize(`${__dirname}/../../data/config.yml`);
fs.readFile(configFile, (err, data) => {
    if (err) throw err;
    config = yaml.safeLoad(data);
});

module.exports = function (key) {
	if (_.has(config, key))
		return config[key];
	return null;
};
