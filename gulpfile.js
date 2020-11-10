// import gulp from 'gulp';
// const { src, series, dest, watch, parallel } = gulp;
const { websiteURL, dev, debug, author, homepage, license, copyright, github, netlify } = require('./config');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const singleSpaces = require("typographic-single-spaces");
const purgecss = require('@fullhuman/postcss-purgecss');
const querySelector = require("posthtml-match-helper");
const minifyJSON = require('gulp-minify-inline-json');
// const phTransformer = require('posthtml-transformer');
const commonJS = require('@rollup/plugin-commonjs');
const { terser } = require('rollup-plugin-terser');
// const { init, write } = require('gulp-sourcemaps');
// const rollupBabel  = require( '@rollup/plugin-babel');
const browserSyncModule = require('browser-sync');
const icons = require('./material-design-icons');
const postHTMLTextr = require("posthtml-textr");
const postHTMLLorem = require("posthtml-lorem");
const sass = require('gulp-sass');
// const buble = require('@rollup/plugin-buble');
const sitemapModule = require('gulp-sitemap');
const autoprefixer = require('autoprefixer');
const rollup = require('gulp-better-rollup');
const posthtml = require('gulp-posthtml');
const htmlmin = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const header = require('gulp-header');
const rename = require('gulp-rename');
const csso = require("postcss-csso");
const moment = require('moment');
const pug = require('gulp-pug');

const rollupEsbuild = require("rollup-plugin-esbuild");
const inline = require("posthtml-inline-assets");
const esbuild = require("gulp-esbuild");

const {
    task,
    stream,
    // streamList,
    // tasks,
    // task,
    watch,
    parallel,
    series
    // parallelFn,
    // seriesFn,
} = require("./util");
const { public } = require('./material-design-icons');

const browserSync = browserSyncModule.create();
// const modernConfig = {
//     "babelrc": false,
//     "babelHelpers": "bundled",
//     "presets": [
//         ["@babel/preset-env", {
//             "useBuiltIns": false,
//             "modules": 'auto',
//             "targets": {
//                 "browsers": ["> 2%"]
//             }
//         }]
//     ]
// };

const bannerContent = [
    ` * @author         ${author.name} (${author.url})`,
    ` * @link           ${homepage}`,
    ` * @github         ${github}`,
    ` * @build          ${moment().format("llll")} ET`,
    ` * @license        ${license}`,
    ` * @copyright      Copyright (c) ${moment().format("YYYY")}, ${copyright}.`,
];

const banner = [
    "/**",
    ...bannerContent,
    ` */`,
].join("\n");

const bannerHTML = [
    "<!--",
    ...bannerContent,
    `-->`,
].join("\n");

// Rollup warnings are annoying
let ignoreLog = ["CIRCULAR_DEPENDENCY", "UNRESOLVED_IMPORT", 'EXTERNAL_DEPENDENCY', 'THIS_IS_UNDEFINED'];
let onwarn = ({ loc, message, code, frame }, warn) => {
    if (ignoreLog.indexOf(code) > -1) return;
    if (loc) {
        warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
        if (frame) warn(frame);
    } else warn(message);
};

// let class_keys = Object.keys(class_map);
// let srcMapsWrite = ["../maps/", {
//     sourceMappingURL: file => {
//         return `/maps/${file.relative}.map`;
//     }
// }];

let minifyOpts = {
    keep_fnames: false, // change to true here
    toplevel: true,
    compress: {
        dead_code: true,
        pure_getters: true
    },
    output: {
        comments: /^!/
    },
    ecma: 2017,
    safari10: false
};
let publicDest = 'public';
let minSuffix = { suffix: ".min" };
let watchDelay = { delay: 1000 };
let { assign } = Object;

task("html", () => {
    return stream('views/pages/**/*.pug', {
        pipes: [
            // Pug compiler
            pug({
                locals: { dev, debug, websiteURL, netlify },
                basedir: 'views',
                self: true
            }),
            minifyJSON(), // Minify application/ld+json
            // Rename
            rename({ extname: ".html" }),
            // Minify or Beautify html
            dev ? null : htmlmin({
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
                removeComments: true,
                collapseWhitespace: true,
                removeEmptyAttributes: false,
                removeRedundantAttributes: true,
                processScripts: ["application/ld+json"]
            }),
            header(bannerHTML),
        ],
        dest: publicDest
    });
});

task("css", () => {
    return stream('src/scss/*.scss', {
        pipes: [
            // Minify scss to css
            sass({ outputStyle: 'compressed' })
                .on('error', sass.logError),
            rename(minSuffix), // Rename
        ],
        dest: `${publicDest}/css`, // Output
        end: [browserSync.stream()]
    });
});


task("minify-css", () => {
    return stream(`${publicDest}/css/*.css`, {
        pipes: [
            // Autoprefix, Remove unused CSS & Compress CSS
            !dev ? postcss([
                purgecss({
                    content: [`views/**/*.pug`],
                    // safelistPatterns: [],
                    safelist: ["active", "show", "focus", "hide", /-show$/, /-initial$/, /-hide$/, /navbar-focus/, /navbar-link-focus/, /btn-expand/, /at-top/],
                    keyframes: false,
                    fontFace: false,
                    // defaultExtractor: (content) => {
                    //     // Capture as liberally as possible, including things like `h-(screen-1.5)`
                    //     const broadMatches =
                    //         content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []; // Capture classes within other delimiters like .block(class="w-1/2") in Pug

                    //     const innerMatches =
                    //         content.match(
                    //             /[^<>"'`\s.(){}\[\]#=%]*[^<>"'`\s.(){}\[\]#=%:]/g
                    //         ) || [];
                    //     return broadMatches.concat(innerMatches);
                    // },
                }),
                autoprefixer({
                    overrideBrowserslist: ["defaults"]
                }),
                csso()
            ]) : null
        ],
        dest: `${publicDest}/css`, // Output
        end: [browserSync.stream()]
    });
});

const jsStream = (type) => {
    let gen = type === 'general';
    let buildOpts = {
        sourcemap: 'external',
        minify: true,
        bundle: true,
        target: gen ? "chrome58" : "es2017", // default, or 'es20XX', 'esnext'
        format: gen ? "iife" : "esm"
    };
    return stream(`src/js/app.js`, {
        pipes: [
            // Bundle Modules
            dev ? esbuild(buildOpts) : rollup({
                treeshake: true,
                plugins: [
                    commonJS(), // Use CommonJS to compile the program
                    nodeResolve(), // Bundle all Modules
                    rollupEsbuild(buildOpts),
                    // buble({
                    //     transforms: { asyncAwait: false },
                    //     // custom `Object.assign` (used in object spread)
                    //     objectAssign: 'Object.assign',
                    // })
                    // rollupBabel(babelConfig.general)
                    // Minify the file
                    terser(
                        assign({}, minifyOpts, gen ? { ie8: true, ecma: 5 } : {})
                    )
                ],
                onwarn
            }, gen ? 'iife' : 'es'),
            rename(`${type}.min.js`), // Rename
            header(banner),
        ],
        dest: `${publicDest}/js` // Output
    });
};
task("modern", () => {
    return jsStream("modern");
});
task("general", done => {
    if (!dev) {
        return jsStream("general");
    } else done();
});
task("app-js", parallel("general", "modern"));
task("other-js", () => {
    let buildOpts = {
        sourcemap: 'external',
        minify: true,
        bundle: true,
        target: "chrome58", // default, or 'es20XX', 'esnext'
        format: 'iife',
    };
    return stream(["src/js/*.js", "!src/js/app.js"], {
        pipes: [
            // Bundle Modules
            dev ? esbuild(buildOpts) : rollup({
                treeshake: true,
                plugins: [
                    commonJS(), // Use CommonJS to compile the program
                    nodeResolve(), // Bundle all Modules
                    rollupEsbuild(buildOpts),
                    // rollupBabel(babelConfig.general)
                    // Minify the file
                    terser(
                        assign({}, minifyOpts, { ie8: true, ecma: 5 })
                    )
                ],
                onwarn
            }, 'iife'),
            rename(minSuffix) // Rename
        ],
        dest: `${publicDest}/js` // Output
    });
});
task("js", parallel("app-js", "other-js"));
task("client", () => {
    return stream("client/**/*", {
        dest: publicDest
    });
});

task("posthtml", () => {
    return stream(`${publicDest}/**/*.html`, {
        pipes: [
            posthtml([
                // Test processes
                postHTMLTextr({}, [singleSpaces]),
                postHTMLLorem(),

                // Inline Icons
                tree => {
                    tree.match(querySelector("i.action-icon"), node => {
                        if ("inline" in node.attrs) {
                            const _attrs = node.attrs;
                            const _content = node.content;
                            delete _attrs['inline'];
                            delete _attrs['async'];
                            node = {
                                tag: 'svg',
                                attrs: {
                                    width: '24', height: '24',
                                    viewBox: '0 0 24 24',
                                    fill: 'currentcolor',
                                    ..._attrs
                                },
                                content: [{
                                    tag: 'path',
                                    attrs: { d: icons[_content] },
                                }]
                            };
                        }

                        return node;
                    });
                }
            ])
        ],
        dest: publicDest
    })
});

task("sitemap", () => {
    return stream(`${publicDest}/**/*.html`, {
        pipes: [
            sitemapModule({
                siteUrl: websiteURL
            })
        ],
        dest: publicDest
    });
});

task("inlineExternal", () => {
    return stream(`${publicDest}/**/*.html`, {
        pipes: [
            posthtml([
                // tree => {
                //     tree.walk(node => {
                //         if (node.tag != 'html') {
                //             let _attrs = node.attrs || {}, key;
                //             if ('ph-inline' in _attrs) {
                //                 key = node.tag == "link" ? "href" : "src";
                //                 if (node.attrs[key][0] == "/" && node.attrs[key].length > 1) {
                //                     node.attrs[key] = node.attrs[key].slice(1);
                //                 }
                //             }
                //         }
                //         return node;
                //     });
                // },

                inline({
                    transforms: {
                        script: {
                            resolve(node) {
                                return node.tag === 'script' && node.attrs && ("ph-inline" in node.attrs) &&
                                    typeof node.attrs.src == "string" && node.attrs.src.length > 1 &&
                                    (node.attrs.src[0] == "/" ? (node.attrs.src + "").slice(1) : node.attrs.src);
                            },
                            transform(node, data) {
                                delete node.attrs.src;
                                delete node.attrs["ph-inline"];
                                if ("async" in node.attrs)
                                    delete node.attrs.async;

                                node.content = [
                                    data.buffer.toString('utf8')
                                ];
                                return node;
                            }
                        },
                        style: {
                            resolve(node) {
                                return node.tag === 'link' && node.attrs && node.attrs.rel === "stylesheet" && ("ph-inline" in node.attrs) &&
                                    typeof node.attrs.href === "string" && node.attrs.href.length > 1 &&
                                    (node.attrs.href[0] == "/" ? (node.attrs.href + "").slice(1) : node.attrs.href);
                            },
                            transform(node, data) {
                                delete node.attrs.href;
                                delete node.attrs.rel;
                                delete node.attrs["ph-inline"];
                                if ("async" in node.attrs)
                                    delete node.attrs.async;

                                node.tag = 'style';
                                node.content = [
                                    data.buffer.toString('utf8')
                                ];
                                return node;
                            }
                        },
                        favicon: false,
                        image: false
                    }
                })
                // Dom process
                // phTransformer({
                //     root: `./${publicDest}`,
                //     minifyJS: false, minifyCSS: false
                // })
            ]),
        ],
        dest: publicDest
    });
});

task("reload", () => {
    return stream(`${publicDest}/**/*.html`, {
        dest: public,
        end: browserSync.reload
    });
});

// Gulp task to minify all files
task("dev-build", series(parallel("client", "html", "js", series("css", "minify-css")), "posthtml"));

// Gulp task to check to make sure a file has changed before minify that file
task("watch", () => {
    browserSync.init({
        server: `./${publicDest}`,
    }, (err, $this) => {
        $this.addMiddleware("*", (req, res) => {
            res.writeHead(302, {
                location: "/404.html"
            });

            res.end("Redirecting!");
        });
    });

    watch('views/**/*.pug', watchDelay, series(parallel("html", "minify-css"), "posthtml", "reload"));
    watch('src/**/*.scss', watchDelay, series("css", "minify-css"));
    watch('src/**/*.js', watchDelay, series("js", "posthtml", "reload"));
    watch('client/**/*', watchDelay, series("client", "posthtml", "reload"));
});

task("serve", series("dev-build", "watch"));

// Gulp task to minify all files, and inline them in the pages
task("default", series("dev-build", parallel("sitemap", "inlineExternal")));
