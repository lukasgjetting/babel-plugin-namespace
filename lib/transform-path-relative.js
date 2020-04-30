'use strict';

exports.__esModule = true;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('babel:plugin:namespace:transform-path-relative');

/**
 * Returns the relative path
 *
 * @param {String} currentFile
 * @param {String} module
 *
 * @return {String}
 */
/**
 * RELATIVE PATH TRANSFORM
 * =======================
 */
var pathToRelative = function pathToRelative() {
    var currentFile = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var module = arguments[1];

    /**
     * babel uses 'unknown' as a special value for filename when the transformed source can't be
     * traced to a file (e.g., transformed string)
     *
     * @link https://github.com/babel/babel/blob/d2e7e6a/packages/babel-core/src/transformation/file/options/config.js
     */
    if (currentFile && currentFile === 'unknown') {
        debug('Warning: missing source path.');
    }

    // Support npm modules instead of directories
    if (/^(npm:)/.test(module)) {
        var _module$split = module.split('npm:'),
            npmModuleName = _module$split[1];

        debug('The current file is npm modules: "%s"', npmModuleName);

        return npmModuleName;
    }

    var sourceDir = (0, _utils.resolveCwd)(_path2.default.dirname(currentFile));
    var modulePath = (0, _utils.resolve)(_path2.default.normalize(module));
    var moduleMapped = _path2.default.relative(sourceDir, modulePath);

    debug('Convert the current file to relative: "%s" (%s)', sourceDir, modulePath);

    if (!/^\./.test(moduleMapped)) {
        moduleMapped = './' + moduleMapped;
    }

    debug('The relative path of the current file is: "%s"', moduleMapped);

    return moduleMapped;
};

exports.default = pathToRelative;
module.exports = exports['default'];