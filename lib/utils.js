'use strict';

exports.__esModule = true;
exports.isPathExists = exports.splitFlatPath = exports.getPackageConfig = exports.resolveCwd = exports.resolve = exports.signDirectoryExpansion = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _appRootPath = require('app-root-path');

var _appRootPath2 = _interopRequireDefault(_appRootPath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * UTILITIES
 * =========
 */
var debug = (0, _debug2.default)('babel:plugin:namespace:helper');

/**
 * TODO:
 * - Implement this logic to "transformModuleNamespace" function
 * - Implement the CommonJS Packages spec details a few ways that you can indicate the structure
 *   of the package using a "directories" object. If you look at npm's package.json, you'll see
 *   that it has directories for doc, lib, and man.
 *
 * We can always use / as a path separator, even on Windows.
 * @link http://bytes.com/forum/thread23123.html
 *
 * Blacklists sign:
 * - @ => @see https://docs.npmjs.com/misc/scope
 *
 * sign => ~
 *
 * - (~) will translate to PROJECT_SOURCE
 * - (~/) will translate to PROJECT_ROOT
 * - (~/foo) will translate to PROJECT_ROOT/foo
 * - (~me/foo) will translate to The subdirectory me/foo of the PROJECT_SOURCE (PROJECT_SOURCE/foo)
 *
 * @link http://www.gnu.org/software/bash/manual/html_node/Tilde-Expansion.html
 *
 * @param {String} value The path to translate
 * @param {String} parentDirectory The parent directory of the given path
 * @param {String} sign The sign symbol
 *
 * @return {String}
 */
/* istanbul ignore next: not yet :) */
var signDirectoryExpansion = function signDirectoryExpansion(value, parentDirectory) {
    var sign = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '~';

    if (!value) {
        return null;
    }

    // @see https://docs.npmjs.com/misc/scope
    if (/^(@)/.test(sign)) {
        return null;
    }

    if (value[0] !== sign) {
        return null;
    }

    value = value.substr(1); // eslint-disable-line no-param-reassign

    if (/^\//.test(value)) {
        return _path2.default.join(_appRootPath2.default, value);
    }

    return _path2.default.join(parentDirectory, value);
};

/**
 * Resolve the given filename to current project root directory
 *
 * @param {String} filename The filename to resolve
 *
 * @return {String}
 */
var resolve = function resolve() {
    var filename = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    // Support npm modules instead of directories
    if (/^(npm:)/.test(filename)) {
        return filename;
    }

    if (filename && _path2.default.isAbsolute(filename)) {
        debug('The filename is absolute: %', filename);

        return filename;
    }

    var resolveFilename = _appRootPath2.default.resolve(filename);

    return resolveFilename;
};

/**
 * Resolve the given filename to current working directory
 *
 * @param {String} filename The filename to resolve
 *
 * @return {String}
 */
var resolveCwd = function resolveCwd() {
    var filename = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    // Support npm modules instead of directories
    /* istanbul ignore if: ??? */
    if (/^(npm:)/.test(filename)) {
        return filename;
    }

    if (filename && _path2.default.isAbsolute(filename)) {
        debug('The filename is absolute: %', filename);

        return filename;
    }

    var resolveFilename = _path2.default.resolve(process.cwd(), filename);

    return resolveFilename;
};

/**
 * Returns the package configuration
 * If namespaceName is set, it will overwrite name
 *
 * @return {Object}
 */
var getPackageConfig = function getPackageConfig() {
    var packageConfig = void 0;

    try {
        packageConfig = require(resolve('package.json')); // eslint-disable-line global-require

        if (packageConfig.namespaceName) {
            packageConfig.name = packageConfig.namespaceName;
        }
    } catch (e) {
        /* istanbul ignore next */
        packageConfig = {};
    }

    return packageConfig;
};

/**
 *
 *
 * @param {Array} directories The directory lists
 *
 * @return {Array}
 */
var splitFlatPath = function splitFlatPath() {
    var directories = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var results = directories.filter(function (pathName) {
        return pathName && pathName.length > 0;
    }).map(function (pathName) {
        return pathName.split(_path2.default.delimiter);
    });

    return [].concat.apply([], results);
};

/**
 * Indicates whether the given path is exists
 *
 * @param {String} sourcePath The path to check
 *
 * @return {String}
 */
var isPathExists = function isPathExists(sourcePath) {
    try {
        var stats = _fs2.default.statSync(resolve(sourcePath));

        return stats.isFile() || stats.isDirectory();
    } catch (error) {
        var basename = _path2.default.basename(sourcePath);

        try {
            return _fs2.default.readdirSync(_path2.default.dirname(sourcePath)).filter(function (pathName) {
                return pathName.indexOf(basename) >= 0;
            }).length > 0;
        } catch (errorStack) {
            return false;
        }
    }
};

exports.signDirectoryExpansion = signDirectoryExpansion;
exports.resolve = resolve;
exports.resolveCwd = resolveCwd;
exports.getPackageConfig = getPackageConfig;
exports.splitFlatPath = splitFlatPath;
exports.isPathExists = isPathExists;