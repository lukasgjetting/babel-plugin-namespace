'use strict';

exports.__esModule = true;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _appRootPath = require('app-root-path');

var _appRootPath2 = _interopRequireDefault(_appRootPath);

var _lodash = require('lodash');

var _utils = require('./utils');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * SOURCE MAP GENERATOR
 * ====================
 */
var debug = (0, _debug2.default)('babel:plugin:namespace:generate-source-maps');

/**
 * Returns the generated source maps.
 *
 * @param {Object} options The babel state options
 *
 * @return {Object}
 */
var generateSourceMaps = function generateSourceMaps() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var patternSeparator = /[,\s]/;
    var results = {};
    var packageConfig = (0, _utils.getPackageConfig)();
    var namespaces = options.namespaces;

    var namespacePaths = [];
    var _options$disableSync = options.disableSync,
        disableSync = _options$disableSync === undefined ? false : _options$disableSync;
    /* istanbul ignore next: really difficult to enter in a unit test */

    var _options$includes = options.includes,
        includes = _options$includes === undefined ? [] : _options$includes,
        _options$sources = options.sources,
        sources = _options$sources === undefined ? _constants.SOURCES_PATH || [] : _options$sources,
        _options$excludes = options.excludes,
        excludes = _options$excludes === undefined ? [] : _options$excludes;


    debug('Start to create a file map');

    // Specially for the package name we use an array
    if ((0, _lodash.isString)(sources)) {
        sources = sources.split(patternSeparator).filter(function (pathName) {
            return !!pathName;
        });
    }

    if ((0, _lodash.isString)(includes)) {
        includes = includes.split(patternSeparator).filter(function (pathName) {
            return !!pathName;
        });
    }

    if ((0, _lodash.isString)(excludes)) {
        excludes = excludes.split(patternSeparator).filter(function (pathName) {
            return !!pathName;
        });
    }

    excludes = (0, _utils.splitFlatPath)((0, _lodash.concat)(excludes, _constants.EXCLUDES_PATH));
    includes = (0, _utils.splitFlatPath)(includes.filter(function (pathName) {
        return excludes.indexOf(pathName) === -1;
    }));
    sources = (0, _utils.splitFlatPath)(sources.filter(function (pathName) {
        return excludes.indexOf(pathName) === -1 && includes.indexOf(pathName) === -1;
    }));

    if (namespaces) {
        for (var namespace in namespaces) {
            /* istanbul ignore if */
            if (!namespaces.hasOwnProperty(namespace)) {
                continue;
            }

            var namespacePath = namespaces[namespace];

            if (!namespacePath) {
                continue;
            }

            if ((0, _lodash.isArray)(namespacePath)) {
                process.stdout.write('Warning: A namespace must be a string');

                continue;
            }

            var sourcesIndexPath = sources.indexOf(namespacePath);

            // We have duplicate pathname. So let's remove them from sources path
            if (sourcesIndexPath >= 0) {
                sources.splice(sourcesIndexPath, 1);
            }

            namespacePaths.push(namespacePath);

            results[namespace] = namespacePath;
        }
    }

    if (!includes.length && !disableSync) {
        debug('The options does not provided included paths. Start to map the directory: %s', _appRootPath2.default);

        includes = _fs2.default.readdirSync((0, _utils.resolve)()).filter(function (pathName) {
            // Is it hidden file?
            if (/^\./.test(pathName)) {
                return false;
            }

            // This is has been registered as the sources path. Skip it
            if (sources.indexOf(pathName) >= 0) {
                return false;
            }

            // This is has been registered as the namespace path. Skip it
            if (namespacePaths.indexOf(pathName) >= 0) {
                return false;
            }

            try {
                var stats = _fs2.default.statSync((0, _utils.resolve)(pathName));

                return stats.isDirectory();
            } catch (err) {
                /* istanbul ignore next: really difficult to enter in a unit test for some reason */
                return false;
            }
        });
    }

    includes.forEach(function (pathName) {
        if (excludes.indexOf(pathName) === -1 && namespacePaths.indexOf(pathName) === -1) {
            var _namespace = packageConfig.name + '/' + pathName;

            results[_namespace] = pathName;
        } else {
            debug('The directory "%s" is not in whitelists', pathName);
        }
    });

    if (sources.length) {
        results[packageConfig.name] = sources;
    }

    var sourceMaps = {};

    // Clean up the source maps and make them as absolute path
    for (var _namespace2 in results) {
        /* istanbul ignore if */
        if (!results.hasOwnProperty(_namespace2)) {
            continue;
        }

        var sourceMapPath = results[_namespace2];

        if (!(0, _lodash.isArray)(sourceMapPath)) {
            sourceMapPath = (0, _utils.resolve)(sourceMapPath);
        } else {
            sourceMapPath = sourceMapPath.map(function (pathName) {
                return (0, _utils.resolve)(pathName);
            });
        }

        sourceMaps[_namespace2] = sourceMapPath;
    }

    debug('The file map has been created: ', sourceMaps);

    return sourceMaps;
};

exports.default = generateSourceMaps;
module.exports = exports['default'];