'use strict';

exports.__esModule = true;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _transformPathRelative = require('./transform-path-relative');

var _transformPathRelative2 = _interopRequireDefault(_transformPathRelative);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * NAMESPACE TRANSFORM
 * ===================
 */
var debug = (0, _debug2.default)('babel:plugin:namespace:transform-namespace');

/**
 * Translate the module namespace
 *
 * @param {String} sourceModule
 * @param {String} sourceFile
 * @param {Object} filesMap
 *
 * @return {String}
 */
var transformModuleNamespace = function transformModuleNamespace(sourceModule, sourceFile, filesMap) {
    if (!sourceModule) {
        return null;
    }

    var module = _path2.default.normalize(sourceModule);

    // should skip if the path is relative or absolute
    if (_path2.default.isAbsolute(module) || /^(\.)/.test(module)) {
        return null;
    }

    var packageConfig = (0, _utils.getPackageConfig)();

    // TODO: Replace with "signDirectoryExpansion"
    if (/^(:|~)/.test(module)) {
        module = _path2.default.join(packageConfig.name, module.substr(1));
    }

    var moduleSplit = module.split('/');
    var sourceModulePath = void 0;

    debug('Start to map a module alias: "%s"', module);

    /**
     * This loop will check the sources map in reverse mode
     */
    while (moduleSplit.length) {
        var part = moduleSplit.join('/');

        if (filesMap.hasOwnProperty(part)) {
            sourceModulePath = filesMap[part];

            break;
        }

        moduleSplit.pop();
    }

    // No mapping available
    if (!moduleSplit.length || !sourceModulePath) {
        debug('Module alias not found: "%s"', module);

        return null;
    }

    var modulePath = moduleSplit.join('/');

    if (Array.isArray(sourceModulePath)) {
        var isPathFound = false;

        sourceModulePath.forEach(function (sourcePath) {
            var newPath = module.replace(modulePath, sourcePath);

            if ((0, _utils.isPathExists)(sourcePath) && (0, _utils.isPathExists)(newPath)) {
                modulePath = newPath;
                isPathFound = true;

                return;
            }
        });

        if (!isPathFound) {
            debug('Module: "%s" (path is not found)', module);

            return null;
        }
    } else {
        modulePath = module.replace(modulePath, sourceModulePath);
    }

    debug('Module alias: "%s" ("%s")', module, modulePath);

    return (0, _transformPathRelative2.default)(sourceFile, modulePath);
};

exports.default = transformModuleNamespace;
module.exports = exports['default'];