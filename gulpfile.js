let { env } = process;
if (!('dev' in env)) require('dotenv').config();
let dev = 'dev' in env && env.dev.toString() === "true";
let debug = 'debug' in env && env.debug.toString() === "true";

const gulp = require('gulp');
const { src, task, series, parallel, dest, watch } = gulp;

const nodeResolve = require('rollup-plugin-node-resolve');
const builtins = require("rollup-plugin-node-builtins");
const querySelector = require("posthtml-match-helper");
const browserSync = require('browser-sync').create();
const { init, write } = require('gulp-sourcemaps');
const commonJS = require('rollup-plugin-commonjs');
const rollupBabel = require('rollup-plugin-babel');
const { stringify } = require('./util/stringify');
const rollupJSON = require("rollup-plugin-json");
const { babelConfig } = require("./browserlist");
const { html, js } = require('gulp-beautify');
const rollup = require('gulp-better-rollup');
const { spawn } = require('child_process');
const posthtml = require('gulp-posthtml');
const { lookup } = require("mime-types");
const htmlmin = require('gulp-htmlmin');
const assets = require("cloudinary").v2;
const postcss = require('gulp-postcss');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const { writeFile } = require("fs");
const config = require('./config');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const axios = require("axios");

let { pages, cloud_name, imageURLConfig } = config;
let assetURL = `https://res.cloudinary.com/${cloud_name}/`;
assets.config({ cloud_name, secure: true });

// Rollup warnings are annoying
let ignoreLog = ["CIRCULAR_DEPENDENCY", "UNRESOLVED_IMPORT", 'EXTERNAL_DEPENDENCY', 'THIS_IS_UNDEFINED'];
let onwarn = ({ loc, message, code, frame }, warn) => {
    if (ignoreLog.indexOf(code) > -1) return;
    if (loc) {
        warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
        if (frame) warn(frame);
    } else warn(message);
};

let srcMapsWrite = ["../maps", {
    sourceMappingURL: file => {
        return `/maps/${file.relative}.map`;
    }
}];

let htmlMinOpts = {
    minifyJS: true,
    minifyCSS: true,
    removeComments: true,
    collapseWhitespace: true,
    removeEmptyAttributes: false,
    removeRedundantAttributes: false,
    processScripts: ["application/ld+json"]
};

let posthtmlOpts = [
    // Test processes
    require('posthtml-textr')({}, [
        require('typographic-single-spaces')
    ]),
    tree => {
        tree.match(/\n\s\w/gim, node => node.replace(/\n\s/gim, ' '));
    },
    tree => {
        let parse = (_src = "src") => node => {
            let url = node.attrs[_src];
            let URLObj = new URL(`${assetURL + url}`.replace("/assets/", ""));
            let query = URLObj.searchParams;
            let queryString = URLObj.search;

            let height = query.get("h");
            let width = query.get("w") || 'auto';
            let crop = query.get("crop") || imageURLConfig.crop;
            let effect = query.get("effect") || imageURLConfig.effect;
            let quality = query.get("quality") || imageURLConfig.quality;
            let _imgURLConfig = { ...imageURLConfig, width, height, quality, crop, effect };
            node.attrs[_src] = (/\/raw\/[^\s"']+/.test(url) ?
                `${assetURL + url.replace(queryString, '')}` :
                assets.url(url.replace(queryString, ''), _imgURLConfig)
            ).replace("/assets/", "");
            return node;
        };

        tree.match(querySelector("[src^='/assets/']"), parse());
        tree.match(querySelector("[srcset^='/assets/']"), parse("srcset"));
    },
    tree => {
        let _src, buf, warnings, mime, promises = [];
        tree.walk(node => {
            if (node.tag === 'img' && node.attrs && node.attrs.src && node.attrs.class &&
                node.attrs.class.includes("placeholder-img")) {
                if (!node.attrs.src.includes("data:image/")) {
                    mime = lookup(_src = node.attrs.src) || 'text/plain';
                    promises.push(
                        axios.get(_src, { responseType: 'arraybuffer' })
                            .then(val => {
                                buf = Buffer.from(val.data, 'base64');
                                node.attrs.src = `data:${mime};base64,${buf.toString('base64')}`;
                            }).catch(err => {
                                console.error(`The image with the src: ${_src} `, err);
                            })
                    );
                }
            }

            return node;
		});

        return Promise.all(promises).then(() => {
            // Filter errors from messages as warnings
            warnings = tree.messages.filter(msg => msg instanceof Error);

            if (warnings.length) {
                // Conditionally warn the user about any issues
                console.warn(`\nWarnings (${warnings.length}):\n${
                    warnings.map(msg => `  ${msg.message}`).join('\n') }\n`);
            }

            // Return the ast
            return tree;
        });
    },

    // Dom process
    require('posthtml-doctype')({ doctype: 'HTML 5' }),
    require('posthtml-link-noreferrer')({
      attr: ['noopener', 'noreferrer']
    }),
    require('posthtml-lazyload')({
      loading: 'auto',
      class: 'core-img',
    }),
    dev ? () => {} : require('posthtml-inline-assets')(),
    require('posthtml-lorem')(),
];

let minifyOpts = {
    // mangle: { reserved: ["$super"] },
    keep_fnames: false, // change to true here
    toplevel: true,
    compress: {
        passes: 5,
        dead_code: true,
        pure_getters: true
    },
    ecma: 8
};
let minSuffix = { suffix: ".min" };
let watchDelay = { delay: 1000 };
let publicDest = 'public';
let { assign } = Object;

// Streamline Gulp Tasks
let stream = (_src, _opt = { }, done) => {
    let _end = _opt.end || [];
    let host = src(_src, _opt.opts), _pipes = _opt.pipes || [], _dest = _opt.dest || publicDest;
    return new Promise((resolve, reject) => {
        _pipes.forEach(val => {
            if (val !== undefined && val !== null)
                { host = host.pipe(val).on('error', reject); }
        });

        host = host.pipe(dest(_dest))
                   .on('end', typeof done === 'function' ? done : resolve); // Output

        _end.forEach(val => {
            if (val !== undefined && val !== null)
                { host = host.pipe(val).on('error', reject); }
        });
    });
};

// A list of streams
let streamList = (...args) => {
    return Promise.all(
        (Array.isArray(args[0]) ? args[0] : args).map(_stream =>
            Array.isArray(_stream) ? stream(..._stream) : _stream
        )
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

task('html', () => {
    let pageNames = Object.keys(pages);
    let pageValues = Object.values(pages);
    return streamList(
        pageValues.map((page, i) =>
            ['views/app.pug', {
                pipes: [
                    // Rename
                    rename({
                        basename: pageNames[i],
                        extname: ".html"
                    }),
                    // Pug compiler
                    pug({ locals: { ...page, cloud_name, dev, debug } }),
                    // Minify or Beautify html
                    dev ? html({ indent_size: 4 }) : htmlmin(htmlMinOpts)
                ]
            }]
        )
    );
});

task("css", () =>
    stream('src/scss/*.scss', {
        pipes: [
            init(), // Sourcemaps init
            // Minify scss to css
            sass({ outputStyle: dev ? 'expanded' : 'compressed' }).on('error', sass.logError),
            // Autoprefix &  Remove unused CSS
            postcss(), // Rest of code is in postcss.config.js
            rename(minSuffix), // Rename
            write(...srcMapsWrite) // Put sourcemap in public folder
        ],
        dest: `${publicDest}/css`, // Output
        end: [browserSync.stream()]
    })
);

task("js", () =>
    streamList([
        ...["modern"].concat(!dev ? "general" : [])
            .map(type => {
                let gen = type === 'general';
                let suffix = gen ? '' : '.modern';
                return ['src/js/app.js', {
                    opts: { allowEmpty: true },
                    pipes: [
                        debug ? null : init(), // Sourcemaps init
                        // Bundle Modules
                        rollup({
                            plugins: [
                                builtins(), // Access to builtin Modules
                                rollupJSON(), // Parse JSON Exports
                                commonJS(), // Use CommonJS to compile the program
                                nodeResolve(), // Bundle all Modules
                                rollupBabel(babelConfig[type]) // Babelify file for uglifing
                            ],
                            onwarn
                        }, gen ? 'umd' : 'es'),
                        // Minify the file
                        debug ? null : terser(
                            assign({}, minifyOpts, gen ? { ie8: true, ecma: 5 } : {})
                        ),
                        rename(`app${suffix}.min.js`), // Rename
                        debug ? null : write(...srcMapsWrite) // Put sourcemap in public folder
                    ],
                    dest: `${publicDest}/js` // Output
                }];
            }),
            ['src/js/app.vendor.js', {
            opts: { allowEmpty: true },
            pipes: [
                init(), // Sourcemaps init
                // Bundle Modules
                rollup({
                    plugins: [
                        builtins(), // Access to builtin Modules
                        rollupJSON(), // Parse JSON Exports
                        commonJS(), // Use CommonJS to compile the program
                        nodeResolve(), // Bundle all Modules
                        rollupBabel(babelConfig.general) // ES5 file for uglifing
                    ],
                    onwarn
                }, 'umd'),
                // Minify the file
                debug ? null : terser(
                    assign({}, minifyOpts, { ie8: true, ecma: 5 })
                ),
                rename(minSuffix), // Rename
                write(...srcMapsWrite) // Put sourcemap in public folder
            ],
            dest: `${publicDest}/js` // Output
        }]
    ])
);

task("config", () =>
    streamList(
        new Promise((resolve, reject) => {
            // Create config-dev.js
            writeFile(
                "./config-dev.js", `module.exports = ${stringify(config)};`,
                err => {
                    if (err) { reject(); throw err; }
                    resolve();
                }
            );
        }),
        ["config-dev.js", {
            opts: { allowEmpty: true },
            pipes: [
                js({ indent_size: 4 }), // Beautify the file
            ],
            dest: '.' // Output
        }]
    )
);

task("client", () =>
    streamList([
        ["client/**/*.js", {
            opts: { allowEmpty: true },
            pipes: [
                terser({ ...minifyOpts, toplevel: false }), // Minify the file
                rename(minSuffix) // Rename
            ],

            dest: `${publicDest}/`
        }], // Output
        [["client/**/*", "!client/**/*.js"], {
            opts: { allowEmpty: true }
        }]
    ])
);

task("gulpfile:watch", () => _exec("gulp"));
task("config:watch", () =>
    _exec("gulp config html css")
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

task('inline', done =>
    stream('public/*.html', {
        pipes: [
            posthtml(posthtmlOpts)
        ]
    }, (...args) => {
        browserSync.reload();
        done(...args);
    })
);

// Gulp task to minify all files
task('dev', parallel("client", series("config", parallel("html", "js"), "css")));

// Gulp task to minify all files, and inline them in the pages
task('default', parallel("client", series("dev", "inline")));

// Gulp task to minify all files without -js
task('other', parallel("client", series("config", "html", "css", "inline")));

// Gulp task to check to make sure a file has changed before minify that file files
task('watch', () => {
    browserSync.init({ server: "./public" });

    watch(['config.js', 'containers.js'], watchDelay, series('config:watch'));
    watch(['gulpfile.js', 'postcss.config.js', 'util/*.js'], watchDelay, series('gulpfile:watch', 'css', 'js'));

    watch('views/**/*.pug', watchDelay, series('html', 'css', 'inline'));
    watch('src/**/*.scss', watchDelay, series('css'));
    watch(['src/**/*.js'], watchDelay, series('js'));
    watch(['client/**/*'], watchDelay, series('client'));

    watch('src/**/app.vendor.js', watchDelay, series('js'));
    watch(['public/**/*', '!public/css/*.css', '!public/**/*.html'])
        .on('change', browserSync.reload);
});
