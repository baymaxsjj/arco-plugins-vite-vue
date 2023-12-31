"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const less_1 = require("./less");
const icon_1 = require("./icon");
const transform_1 = require("./transform");
const pkg = require('../../package.json');
function vitePluginArcoImport(options = {}) {
    const { theme = '', iconBox = '', modifyVars = {}, style = true, varsInjectScope = [], componentPrefix = 'a', iconPrefix = 'icon', } = options;
    let styleOptimization;
    let iconBoxLib;
    let resolvedConfig;
    let isDevelopment = false;
    if (iconBox) {
        try {
            iconBoxLib = require(iconBox); // eslint-disable-line
        }
        catch (e) {
            throw new Error(`IconBox ${iconBox} not existed`);
        }
    }
    return {
        name: pkg.name,
        config(config, { command }) {
            isDevelopment = command === 'serve';
            // Lay load
            styleOptimization = command === 'build';
            // css preprocessorOptions
            (0, less_1.modifyCssConfig)(pkg.name, config, theme, modifyVars, varsInjectScope);
            // iconbox
            (0, icon_1.modifyIconConfig)(config, iconBox, iconBoxLib);
        },
        async load(id) {
            const res = (0, icon_1.loadIcon)(id, iconBox, iconBoxLib);
            if (res !== undefined) {
                return res;
            }
            // other ids should be handled as usually
            return null;
        },
        configResolved(config) {
            resolvedConfig = config;
            // console.log('viteConfig', resolvedConfig)
        },
        transform(code, id) {
            // transform css files
            const res = (0, transform_1.transformCssFile)({
                code,
                id,
                theme,
            });
            if (res !== undefined) {
                return res;
            }
            // css lazy load
            return (0, transform_1.transformJsFiles)({
                code,
                id,
                theme,
                style,
                styleOptimization,
                sourceMaps: isDevelopment || Boolean(resolvedConfig?.build?.sourcemap),
                componentPrefix,
                iconPrefix,
            });
        },
    };
}
exports.default = vitePluginArcoImport;
