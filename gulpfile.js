const gulp = require('gulp');
const { src, task, series, dest, watch } = gulp;

const { author, homepage, license, copyright, github } = require("./package.json");
const { websiteURL, class_map, dev, debug } = require('./config');
const nodeResolve = require('@rollup/plugin-node-resolve');
const builtins = require("rollup-plugin-node-builtins");
const querySelector = require("posthtml-match-helper");
const phTransformer = require('posthtml-transformer');
const browserSync = require('browser-sync').create();
const commonJS = require('@rollup/plugin-commonjs');
const { init, write } = require('gulp-sourcemaps');
const { terser } = require('rollup-plugin-terser');
const rollupBabel = require('rollup-plugin-babel');
const rollupJSON = require("@rollup/plugin-json");
const { babelConfig } = require("./browserlist");
const buble = require('@rollup/plugin-buble');
const rollup = require('gulp-better-rollup');
const stringify = require('fast-stringify');
const { spawn } = require('child_process');
const gitRevSync = require('git-rev-sync');
const nunjucks = require('gulp-nunjucks');
const posthtml = require('gulp-posthtml');
// const imagemin = require('gulp-imagemin');
const postcssNative = require('postcss');
const htmlmin = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const sitemap = require('gulp-sitemap');
const header = require('gulp-header');
const rename = require('gulp-rename');
const size = require('gulp-size');
const sass = require('gulp-sass');
const moment = require('moment');
const pug = require('gulp-pug');

let icons;
(!debug) && (icons = require('microicon'));

const bannerContent = [
    ` * @author         ${author}`,
    ` * @link           ${homepage}`,
    ` * @github         ${github}`,
    ` * @build          ${moment().format("llll")} ET`,
    ` * @release        ${gitRevSync.long()} [${gitRevSync.branch()}]`,
    ` * @license        ${license}`,
    ` * @copyright      Copyright (c) ${moment().format("YYYY")}, ${copyright}.`,
];

const banner = [
    "/**",
    ...bannerContent,
    ` */`,
    "\n"
].join("\n");

const bannerHTML = [
    "<!--",
    ...bannerContent,
    `-->`,
    "\n"
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

let class_keys = Object.keys(class_map);
let srcMapsWrite = ["../maps/", {
    sourceMappingURL: file => {
        return `maps/${file.relative}.map`;
    }
}];

let minifyOpts = {
    keep_fnames: false, // change to true here
    toplevel: true,
    compress: {
        dead_code: true,
        pure_getters: true
    },
    ecma: 8,
    safari10: false
};
let minSuffix = { suffix: ".min" };
let watchDelay = { delay: 1000 };
let publicDest = 'public';
let { assign } = Object;

// Streamline Gulp Tasks
let stream = (_src, _opt = { }) => {
    let _end = _opt.end || [];
    let host = src(_src, _opt.opts), _pipes = _opt.pipes || [],
        _dest = _opt.dest || publicDest, _log = _opt.log || (() => {});

    return new Promise((resolve, reject) => {
        _pipes.forEach(val => {
            if (val !== undefined && val !== null)
            { host = host.pipe(val).on('error', reject); }
        });

        host.on('end', _log)
            .on('error', reject)
            .pipe(dest(_dest))
            .on('end', resolve); // Output

        _end.forEach(val => {
            if (val !== undefined && val !== null)
                { host = host.pipe(val); }
        });
    });
};

// A list of streams
let streamList = (...args) => {
    return Promise.all(
        (Array.isArray(args[0]) ? args[0] : args).map(_stream => {
            return Array.isArray(_stream) ? stream(..._stream) : _stream
        })
    );
};

// Based on: [https://gist.github.com/millermedeiros/4724047]
let _exec = cmd => {
    var parts = cmd.toString().split(/\s+/g);
    return new Promise((resolve = () => {}) => {
        spawn(parts[0], parts.slice(1), { shell: true, stdio: 'inherit' })
            .on('data', data => process.stdout.write(data))
            .on('error', err => console.error(err))
            .on('close', () => (resolve || function () {}) ());
    });
};

// Execute multiple commands in series
let _execSeries = (...cmds) => {
    return Promise.all(
        cmds.reduce((acc, cmd, i) => {
            if (cmd !== null && cmd !== undefined)
                acc[i] = typeof cmd === "string" ? _exec(cmd) : cmd;
            return acc;
        }, [])
    );
};

task('html', () => stream(
    'views/pages/*.pug', {
        pipes: [
            // Pug compiler
            pug({ locals: { dev, debug, websiteURL } }),
            // Rename
            rename({ extname: ".html" }),
            // Minify or Beautify html
            dev ? null : htmlmin({
                minifyJS: true,
                minifyCSS: true,
                removeComments: true,
                collapseWhitespace: true,
                removeEmptyAttributes: false,
                removeRedundantAttributes: true,
                processScripts: ["application/ld+json"]
            }),
            size({gzip: true, showFiles: true}),
            header(bannerHTML),
        ]
    })
);

task("css", () =>
    stream('src/scss/*.scss', {
        pipes: [
            // Minify scss to css
            sass({ outputStyle: dev ? 'expanded' : 'compressed' })
                .on('error', sass.logError),
            rename(minSuffix), // Rename
            // Autoprefix &  Remove unused CSS
            postcss(), // Rest of code is in postcss.config.js
            header(banner),
            dev ? null : init(), // Sourcemaps init
            dev ? null : write(...srcMapsWrite) // Put sourcemap in public folder
        ],
        dest: `${publicDest}/css`, // Output
        end: [browserSync.stream()]
    })
);

task("env-js", () =>
    stream('src/js/**/*.js', {
        opts: { allowEmpty: true },
        pipes: [
            // Include enviroment variables in JS
            nunjucks.compile({
                class_keys: stringify(class_keys),
                class_map: stringify(class_map),
                dev 
            })
        ],
        dest: `${publicDest}/js`, // Output
    })
);

task("web-js", () =>
    streamList([
        ...["modern"].concat(!dev ? "general" : [])
            .map(type => {
                let gen = type === 'general';
                return ['public/js/app.js', {
                    opts: { allowEmpty: true },
                    pipes: [
                        // Bundle Modules
                        rollup({
                            plugins: [
                                builtins(), // Access to builtin Modules
                                rollupJSON(), // Parse JSON Exports
                                commonJS(), // Use CommonJS to compile the program
                                nodeResolve(), // Bundle all Modules
                                gen ? buble({
                                    // custom `Object.assign` (used in object spread)
                                    objectAssign: 'Object.assign',
                                }) : rollupBabel(babelConfig[type]) // Babelify file for uglifing
                            ].concat(
                                // Minify the file
                                debug ? [] : terser(
                                    assign({}, minifyOpts, gen ? { ie8: true, ecma: 5 } : {})
                                )
                            ),
                            onwarn
                        }, gen ? 'iife' : 'es'),
                        rename(`${type}.min.js`), // Rename
                        header(banner),
                        dev ? null : init(), // Sourcemaps init
                        dev ? null : write(...srcMapsWrite) // Put sourcemap in public folder
                    ],
                    dest: `${publicDest}/js` // Output
                }];
            }),
        dev ? null : [['public/js/*.js', '!public/js/app.js', '!public/js/*.min.js'], {
            opts: { allowEmpty: true },
            pipes: [
                // Bundle Modules
                rollup({
                    plugins: [
                        builtins(), // Access to builtin Modules
                        rollupJSON(), // Parse JSON Exports
                        commonJS(), // Use CommonJS to compile the program
                        nodeResolve(), // Bundle all Modules
                        // Babelify file for uglifing
                        buble({
                            // custom `Object.assign` (used in object spread)
                            objectAssign: 'Object.assign',
                        })
                        // rollupBabel(babelConfig.general) 
                    ].concat(
                        // Minify the file
                        debug ? [] : terser(
                            assign({}, minifyOpts, { ie8: true, ecma: 5 })
                        )
                    ),
                    onwarn
                }, 'iife'),
                rename(minSuffix), // Rename
                header(banner)
            ],
            dest: `${publicDest}/js` // Output
        }]
    ])
);

task("js", series("env-js", "web-js") );

task("client", () =>
    streamList([
        [["client/**/*", "!client/**/*.{png,ico,svg}"], {
            opts: { allowEmpty: true }
        }],
        [["client/**/*.{png,ico,svg}"], {
            opts: { allowEmpty: true },
            // pipes: [
            //     imagemin({
            //         progressive: true,
            //         interlaced: true,
            //         optimizationLevel: 7,
            //         svgoPlugins: [{removeViewBox: false}],
            //         verbose: false,
            //         use: []
            //     })
            // ]
        }]
    ])
);

task("gulp:reload", () => {
    _execSeries("gulp pre-watch", "gulp watch");
    process.exit();
});

task("git:push", () => {
    let commit = process.argv[3] || 'Upgrade';
    return _execSeries(
        "git add --ignore-removal .",
        `git commit -m '${commit}'`,
        "git push -u origin master"
    )
});

task("git:pull", () =>
    _exec("git pull origin master")
);

task('posthtml', () =>
    stream('public/*.html', {
        pipes: [
            posthtml([
                // Test processes
                require('posthtml-textr')({}, [
                    require('typographic-single-spaces')
                ]),
                require('posthtml-lorem')()
            ])
        ]
    })
);

task('sitemap', () =>
    stream('public/*.html', {
        pipes: [
            sitemap({ siteUrl: websiteURL })
        ]
    })
);

task('inline-assets', () =>
    stream('public/*.html', {
        pipes: [
            posthtml([
                debug ? () => {} : tree => {
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
                },
            ]),
        ]
    })
);

task('optimize-class-names', () =>
    streamList([
        [`${publicDest}/css/*.css`, {
            pipes: [
                postcss([
                    postcssNative.plugin('optimize-css-name', () => {
                        let class_keys = Object.keys(class_map);
                        return css => {
                            css.walkRules(rule => {
                                let { selector } = rule;

                                if (selector && selector[0] !== ":" && !selector.includes("::")) {
                                    for (let i = 0; i < class_keys.length; i ++) {
                                        if (selector.includes(class_keys[i])) {
                                            let regex = new RegExp(class_keys[i], 'g');
                                            selector = selector.replace(regex, class_map[class_keys[i]]);
                                        }
                                    }
                                }

                                rule.selector = selector;
                                return rule;
                            });
                        }
                    })()
                ]),
                dev ? null : init(), // Sourcemaps init
                dev ? null : write(...srcMapsWrite) // Put sourcemap in public folder
            ],
            dest: `${publicDest}/css`, // Output
        }],
        [`${publicDest}/*.html`, {
            pipes: [
                posthtml([
                    tree => {
                        tree.walk(node => {
                            if (node.tag != 'html') {
                                let _attrs = node.attrs || {};
                                let _class;
                                if (typeof _attrs.class == 'string') {
                                    _class = _attrs.class;
                                    for (let i = 0; i < class_keys.length; i ++) {
                                        if (_class.includes(class_keys[i])) {
                                            let regex = new RegExp(class_keys[i], 'g');
                                            _class = _class.replace(regex, class_map[class_keys[i]]);
                                        }
                                    }

                                    node.attrs = { ..._attrs };
                                    node.attrs.class = _class;
                                }
                            }
                            return node;
                        });
                    },
                ]),
            ]
        }]
    ])
);

task('inline-js-css', () =>
    stream('public/*.html', {
        pipes: [
            posthtml([
                // Dom process
                debug ? () => { } : phTransformer({
                    root: `${publicDest}`,
                    minifyJS: false, minifyCSS: false
                })
            ]),
            // sriHash()
        ]
    })
);

task('reload', done =>
    stream('public/*.html', { })
        .then((...args) => {
            browserSync.reload();
            done(...args);
        })
);

// Gulp task to minify all files
task('dev', series("client", "html", "js", "css"));

// Gulp task to minify all files, and inline them in the pages
task('default', series("dev", "posthtml", "sitemap", "inline-assets", "optimize-class-names", "inline-js-css"));

// Gulp task to run before watching for file changes
task('frontend', series("dev", "posthtml", "inline-assets", "optimize-class-names"));

// Gulp task to check to make sure a file has changed before minify that file
task('watch', () => {
    browserSync.init({ server: "./public" });

    watch(['gulpfile.js', 'postcss.config.js'], watchDelay, series('gulp:reload', 'reload'));

    watch('views/**/*.pug', watchDelay, series('html', 'css', "posthtml", "inline-assets", 'reload'));
    watch('src/**/*.scss', watchDelay, series('css'));
    watch('src/**/*.js', watchDelay, series('js', 'reload'));
    watch(['client/**/*'], watchDelay, series('client', "inline-assets", 'reload'));
});

// Gulp task to check to make sure a css file has changed before minify that file
task('watch-frontend', () => {
    watch('views/**/*.pug', watchDelay, series("html", "css", "posthtml", "inline-assets", "optimize-class-names"));
    watch('src/**/*.scss', watchDelay, series("css", "optimize-class-names"));
    watch('src/**/*.js', watchDelay, series('js', "optimize-class-names"));
});
