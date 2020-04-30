'use strict';

exports.__esModule = true;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _generateSourceMaps = require('./generate-source-maps');

var _generateSourceMaps2 = _interopRequireDefault(_generateSourceMaps);

var _transformNamespace = require('./transform-namespace');

var _transformNamespace2 = _interopRequireDefault(_transformNamespace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('babel:plugin:namespace'); /**
                                                             * This source file is part of my personal project.
                                                             *
                                                             * This source code license can be found in the LICENSE file in the root directory of this
                                                             * source tree.
                                                             *
                                                             * @author    Yudha Setiawan <me@yudhasetiawan.com>
                                                             * @link      http://yudhasetiawan.com
                                                             * @copyright Copyright (c) 2016, Yudha Setiawan.
                                                             */

exports.default = function (_ref) {
    var t = _ref.types;

    var isRequireCall = function isRequireCall(node) {
        /* istanbul ignore if */
        if (!t.isCallExpression(node)) {
            return false;
        }

        if (!t.isIdentifier(node.callee, { name: 'require' }) && !(t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.object, { name: 'require' }) && t.isIdentifier(node.callee.property, { name: 'requireActual' }))) {
            return false;
        }

        return true;
    };

    /**
     * Replace the module name
     */
    function resolveModuleName(moduleArg, state) {
        if (!t.isStringLiteral(moduleArg)) {
            return null;
        }

        debug('Start to transform module alias: "%s"', moduleArg.value);

        var module = (0, _transformNamespace2.default)(moduleArg.value, state.file.opts.filename, (0, _generateSourceMaps2.default)(state.opts));

        if (!module) {
            return null;
        }

        debug('Module alias found and will try to replace: "%s" (%s)', moduleArg.value, module);

        moduleArg.value = module; // eslint-disable-line no-param-reassign

        return module;
    }

    /**
     * Transforms `require('Foo')` and `require.requireActual('Foo')`.
     */
    function transformRequireCall(nodePath, state) {
        if (!isRequireCall(nodePath.node)) {
            return;
        }

        var args = nodePath.node.arguments;

        if (!args.length) {
            return;
        }

        var modulePath = resolveModuleName(args[0], state);

        if (!modulePath) {
            return;
        }

        // See comment bellow
        // return nodePath.replaceWith(
        //     t.callExpression(nodePath.node.callee, [t.stringLiteral(modulePath)])
        // );
    }

    function transformImportCall(nodePath, state) {
        var moduleArg = nodePath.node.source;

        // usually happens when a conflict with a plugin arises
        /* istanbul ignore if */
        if (!moduleArg.extra || !moduleArg.extra.rawValue) {
            return;
        }

        var modulePath = resolveModuleName(moduleArg, state);

        if (!modulePath) {
            return;
        }

        // I don't know why this throw an error
        // return nodePath.replaceWith(
        //     t.importDeclaration(nodePath.node.specifiers, [t.stringLiteral(modulePath)])
        // );
    }

    return {
        visitor: {
            CallExpression: {
                exit: function exit(nodePath, state) {
                    return transformRequireCall(nodePath, state);
                }
            },
            ImportDeclaration: {
                exit: function exit(nodePath, state) {
                    return transformImportCall(nodePath, state);
                }
            }
        }
    };
};

module.exports = exports['default'];