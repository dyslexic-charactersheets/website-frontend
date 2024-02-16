function isString(val) {
  return typeof val === 'string' || val instanceof String;
}

function isNumber(val) {
  return Number.isFinite(val);
}

function isEmpty(obj) {
  return obj === undefined || obj === null || (isString(obj) && obj == "") || (isNumber(obj) && isNaN(obj));
}

function has(obj, key) {
  // console.log("has", obj, key);
  return !isEmpty(obj) && Object.prototype.hasOwnProperty.call(obj, key) && !isEmpty(obj[key]);
}

function slugify(str) {
  str = str.toLowerCase();
  str = str.replace("'", "");
  str = str.replace(/ \(.*\)/, '');
  str = str.split(/[ _/-]+/).join('-');
  return str;
}

module.exports = {
  isEmpty,
  isNumber,
  isString,
  has,
  slugify
}
