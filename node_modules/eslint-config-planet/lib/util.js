/**
 * Test if a value is an object (and not null).
 * @param {*} obj The member to test.
 * @return {boolean} The member is an object.
 */
function isObject(obj) {
  return typeof obj === 'object' && obj !== null;
}

/**
 * Deep merge with array concatenation.  May include multiple src arguments.
 * @param {Object} dest The object to modify.
 * @param {Object} src The source object.
 * @return {Object} The modified dest object.
 */
function merge(dest, src) {
  for (var key in src) {
    if (Array.isArray(src[key])) {
      dest[key] = (dest[key] || []).concat(src[key]);
    } else if (isObject(src[key])) {
      dest[key] = merge(dest[key] || {}, src[key]);
    } else {
      dest[key] = src[key];
    }
  }
  if (arguments.length > 2) {
    var args = Array.prototype.slice.call(arguments);
    args.splice(1, 1);
    merge.apply(null, args);
  }
  return dest;
}

exports.merge = merge;
