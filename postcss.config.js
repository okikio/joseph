const purgecss = require('@fullhuman/postcss-purgecss');
const { general } = require("./browserlist");
const autoprefixer = require('autoprefixer');
const csso = require("postcss-csso");

module.exports = {
    plugins: [
        purgecss({
            content: ['public/**/*.html'],
            whitelistPatterns: [/-show$/, /-hide$/, /navbar-focus/, /navbar-link-focus/, /btn-expand/],
            keyframes: false,
            fontFace: false
        }),
        autoprefixer({
            overrideBrowserslist: general
        }),
        csso({ sourceMap: true })
    ]
};
