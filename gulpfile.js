const gulp = require('gulp');
const { src, task, series, dest, watch, parallel } = gulp;

const { websiteURL, dev, debug, author, homepage, license, copyright, github } = require('./config'); // class_map,
const nodeResolve = require('@rollup/plugin-node-resolve');
const purgecss = require('@fullhuman/postcss-purgecss');
const querySelector = require("posthtml-match-helper");
const minifyJSON = require('gulp-minify-inline-json');
const phTransformer = require('posthtml-transformer');
const browserSync = require('browser-sync').create();
const commonJS = require('@rollup/plugin-commonjs');
const { terser } = require('rollup-plugin-terser');
const { init, write } = require('gulp-sourcemaps');
const rollupBabel = require('rollup-plugin-babel');
const buble = require('@rollup/plugin-buble');
const autoprefixer = require('autoprefixer');
const rollup = require('gulp-better-rollup');
// const stringify = require('fast-stringify');
const { spawn } = require('child_process');
// const nunjucks = require('gulp-nunjucks');
const posthtml = require('gulp-posthtml');
// const postcssNative = require('postcss');
const htmlmin = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const sitemap = require('gulp-sitemap');
const header = require('gulp-header');
const rename = require('gulp-rename');
const csso = require("postcss-csso");
const cache = require('gulp-cached');
// const size = require('gulp-size');
const sass = require('gulp-sass');
const moment = require('moment');
const pug = require('gulp-pug');
// const path = require("path");
// const fs = require('fs');

let icons;
// (!debug) && (icons = require('microicon'));
(!debug) && (icons = require('./material-design-icons'));

const modernConfig = {
    "babelrc": false,
    "presets": [
        ["@babel/preset-env", {
            "useBuiltIns": false,
            "modules": 'auto',
            "targets": {
                "browsers": ["> 2%"]
            }
        }]
    ]
};

const bannerContent = [
    ` * @author         ${author}`,
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
let srcMapsWrite = ["../maps/", {
    sourceMappingURL: file => {
        return `/maps/${file.relative}.map`;
    }
}];

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
    'views/pages/**/*.pug', {
        pipes: [
            cache('pug'),
            // Pug compiler
            pug({
                locals: { dev, debug, websiteURL },
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
            // size({gzip: true, showFiles: true}),
            header(bannerHTML),
        ]
    })
);

task("css", () =>
    stream('src/scss/*.scss', {
        pipes: [
            cache('sass'),
            // Minify scss to css
            sass({ outputStyle: dev ? 'expanded' : 'compressed' })
                .on('error', sass.logError),
            rename(minSuffix), // Rename
            // Autoprefix, Remove unused CSS & Compress CSS
            postcss([
                autoprefixer({
                    overrideBrowserslist: ["defaults, IE 8"]
                }),
                csso() // { sourceMap: true }
            ])
            // header(banner),
            // init(), // Sourcemaps init
            // write(...srcMapsWrite) // Put sourcemap in public folder
        ],
        dest: `${publicDest}/css`, // Output
        end: [browserSync.stream()]
    })
);

/*
task("env-js", () =>
    stream('src/js/** /*.js', {
        opts: { allowEmpty: true },
        pipes: [
            // Include enviroment variables in JS
            // nunjucks.compile({
            //     // class_keys: stringify(class_keys),
            //     // class_map: stringify(class_map),
            //     dev
            // })
        ],
        dest: `${publicDest}/js`, // Output
    })
);*/

let webJS;
task("web-js", webJS = () =>
    streamList([
        ...["modern"].concat(!dev ? "general" : [])
            .map(type => {
                let gen = type === 'general';
                return [`src/js/app.js`, {
                    opts: { allowEmpty: true },
                    pipes: [
                        init(), // Sourcemaps init
                        // Bundle Modules
                        rollup({
                            treeshake: true,
                            plugins: [
                                // rollupJSON(), // Parse JSON Exports
                                commonJS(), // Use CommonJS to compile the program
                                nodeResolve(), // Bundle all Modules
                                gen ? buble({
                                    transforms: { asyncAwait: false },
                                    // custom `Object.assign` (used in object spread)
                                    objectAssign: 'Object.assign',
                                }) : rollupBabel(modernConfig) // Babelify file for uglifing
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
                        write(...srcMapsWrite), // Put sourcemap in public folder
                    ],
                    dest: `${publicDest}/js` // Output
                }];
            }),
            // , `!${publicDest}/js/*.min.js`
        [["src/js/*.js", "!src/js/app.js"], {
            // , `!${publicDest}/js/.js`
            opts: { allowEmpty: true },
            pipes: [
                cache('web-js'),
                // Bundle Modules
                rollup({
                    treeshake: true,
                    plugins: [
                        // rollupJSON(), // Parse JSON Exports
                        commonJS(), // Use CommonJS to compile the program
                        nodeResolve(), // Bundle all Modules
                        // Babelify file for uglifing
                        buble({
                            transforms: { asyncAwait: false },
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

                rename(minSuffix) // Rename
                // header(banner)
            ],
            dest: `${publicDest}/js` // Output
        }]
    ])
);

task("js", webJS); //series("env-js", "web-js")

task("client", () =>
    streamList([
        [["client/**/*", "!client/**/*.{png,ico,svg}"], {
            opts: { allowEmpty: true }
        }],
        [["client/**/*.{png,ico,svg}"], {
            opts: { allowEmpty: true }
        }]
    ])
);

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
    stream(`${publicDest}/**/*.html`, {
        pipes: [
            cache('posthtml'),
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
    stream(`${publicDest}/**/*.html`, {
        pipes: [
            cache('sitemap'),
            sitemap({ siteUrl: websiteURL })
        ]
    })
);

task('inline-assets', () =>
    streamList([
        // Inline fonts don't enhance performance
        /* [`${publicDest}/css/fonts.min.css`, {
            pipes: [
                postcss([
                    postcssNative.plugin('inline-fonts', () => {
                        let fonts = [
                            ['Montserrat', 800],
                            ['Frank Ruhl Libre', 900]
                        ];
                        let fontFamily = fonts.map(font => font[0]);
                        let fontWeight = fonts.map(font => font[1]);
                        let _escape = str => str.replace(/"|'/g, "");
                        return root => {
                            root.walkAtRules(rule => {
                                if (rule.name == "font-face") {
                                    let checkCounter = 0;
                                    rule.each(i => {
                                        if ((i.prop == "font-family" && fontFamily.includes( _escape(i.value) )) ||
                                            (i.prop == "font-weight" && fontWeight.includes( +i.value )) ||
                                             i.prop == "--latin")
                                                checkCounter ++;
                                    });

                                    rule.walkDecls(decl => {
                                        if (decl.prop == "--latin") decl.remove();
                                        if (decl.prop == "src" && checkCounter == 3) {
                                            let value = decl.value;
                                            let src = value.match(/url\((.+\.woff2)\)/)[1];
                                            let data = fs.readFileSync(path.join(publicDest, src)).toString('base64');
                                            // Transform each property declaration here
                                            decl.value = value.replace(/url\((.+\.woff2)\)/, `url(data:application/font-woff2;charset=utf-8;base64,${data})`);
                                        }

                                        return decl;
                                    });
                                }

                                return rule;
                            });
                        }
                    })()
                ]),
            ],
            dest: `${publicDest}/css`, // Output
        }],*/
        [`${publicDest}/**/*.html`, {
            pipes: [
                cache('inline-assets'),
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
        }]
    ])
);

/*
task('optimize-class-names', () =>
    streamList([
        dev ? null : [`${publicDest}/css/*.css`, {
            pipes: [
                postcss([
                    postcssNative.plugin('optimize-css-name', () => {
                        let class_keys = Object.keys(class_map);
                        return root => {
                            root.walkRules(rule => {
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
                // dev ? null : init(), // Sourcemaps init
                // dev ? null : write(...srcMapsWrite) // Put sourcemap in public folder
            ],
            dest: `${publicDest}/css`, // Output
        }],
        dev ? null : [`${publicDest}/** /*.html`, {
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
*/

task('inline-js-css', () =>
    streamList([
        [`${publicDest}/css/*.css`, {
            pipes: [
                cache('purge-css'),
                postcss([
                    purgecss({
                        content: [`${publicDest}/**/*.html`],
                        whitelistPatterns: [/-show$/, /-initial$/, /-hide$/, /navbar-focus/, /navbar-link-focus/, /btn-expand/, /at-top/],
                        keyframes: false,
                        fontFace: false
                    }),
                ])
            ]
        }],
        [`${publicDest}/**/*.html`, {
            pipes: [
                cache('inline-js-css'),
                posthtml([
                    tree => {
                        tree.walk(node => {
                            if (node.tag != 'html') {
                                let _attrs = node.attrs || {}, key;
                                if ('ph-inline' in _attrs) {
                                    node.attrs = { ..._attrs };
                                    key = node.tag == "link" ? "href" : "src";
                                    node.attrs[key] = node.attrs[key].slice(1);
                                }
                            }
                            return node;
                        });
                    },
                    // Dom process
                    debug ? () => { } : phTransformer({
                        root: `./${publicDest}`,
                        minifyJS: false, minifyCSS: false
                    })
                ]),
                // sriHash()
            ]
        }]
    ])
);

task('reload', done =>
    stream(`${publicDest}/**/*.html`, { })
        .then((...args) => {
            browserSync.reload();
            done(...args);
        })
);

// Gulp task to minify all files
task('dev', series(parallel("client", "html", "js"), "css"));

// Gulp task to minify all files, and inline them in the pages
// "optimize-class-names",
task('default', series("dev", "sitemap", "posthtml", "inline-assets", "inline-js-css"));

// Gulp task to run before watching for file changes
// , "optimize-class-names"
task('frontend', series("dev", "posthtml", "inline-assets"));

// Gulp task to check to make sure a file has changed before minify that file
task('watch', () => {
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

    watch('views/**/*.pug', watchDelay, series(parallel('html', 'css'), "posthtml", "inline-assets", 'reload'));
    watch('src/**/*.scss', watchDelay, series('css'));
    watch('src/**/*.js', watchDelay, series('js', "inline-assets", 'reload'));
    watch(['client/**/*'], watchDelay, series('client', "inline-assets", 'reload'));
});

// Gulp task to check to make sure a css file has changed before minify that file
task('watch-frontend', () => {
    // , "optimize-class-names"
    watch('views/**/*.pug', watchDelay, series(parallel("html", "css"), "posthtml", "inline-assets"));
    watch('src/**/*.scss', watchDelay, series("css")); // , "optimize-class-names"
    watch('src/**/*.js', watchDelay, series('js')); // , "optimize-class-names"
});
