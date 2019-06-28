const gulp = require('gulp');
const { src, task, series, parallel, dest, watch } = gulp;
const { spawn } = require('child_process');
const modifyFile = require('gulp-modify-file');
const autoprefixer = require('autoprefixer');
const sourcemap = require('gulp-sourcemaps');
const beautify = require('gulp-beautify');
const htmlmin = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const cssnano = require('cssnano');
const config = require('./config');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const $if = require('gulp-if');
const { pages } = config;

let last;
let plugins = [
    autoprefixer,
    cssnano
];

let htmlMinOpts = {
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    processScripts: ["application/ld+json"],
    removeComments: true,
    removeEmptyAttributes: false,
    removeRedundantAttributes: false
};

let minSuffix = { suffix: ".min" };
let watchDelay = { delay: 500 };
let publicDest = 'public';
let babelPresets = {
    presets: ['@babel/env']
};

// Stringify
let stringify = obj => {
    let fns = [];
    let json = JSON.stringify(obj, (key, val) => {
        if (typeof val == "function") {
            fns.push(val.toString());
            return "_";
        }
        return val;
    }, 4);

    return json.replace(/\"_\"/g, () => fns.shift());
};

// Based on: [https://gist.github.com/millermedeiros/4724047]
let exec = (cmd, cb) => {
    var parts = cmd.split(/\s+/g);
    spawn(parts[0], parts.slice(1), { stdio: 'inherit' })
        .on('data', data => process.stdout.write(data))
        .on('exit', code => {
            var err = null;
            if (code) {
                err = new Error('Command "'+ cmd +'" exited with wrong status code "'+ code +'"');
                err.code = code;
                err.cmd = cmd;
            }
            if (cb) { cb(err); }
        });
};

// Execute multiple commands in series
let execSeries = (cmds, cb) => {
    var execNext = () => {
        exec(cmds.shift(), err => {
            if (err) { cb(err); }
            else {
                if (cmds.length) execNext();
                else cb(null);
            }
        });
    };
    execNext();
};

task('html', () => {
    for (let i in pages)
        last = src('views/app.pug')
            // Pug compiler
            .pipe(pug({
                data: pages[i]
            }))
            // Minifies html
            .pipe(
                $if(
                    process.env.NODE_ENV == "production",
                    htmlmin(htmlMinOpts),
                    beautify.html({ indent_size: 4 })
                )
            )
            // Rename
            .pipe(rename({
                basename: i,
                extname: ".html"
            }))
            // Output
            .pipe(dest(publicDest));
    return last;
});

task("css", () =>
    src('src/scss/app.scss')
        // Sourcemaps start
        .pipe(sourcemap.init())
        // Compile to css
        .pipe(sass().on('error', sass.logError))
        // Minify & Autoprefix the file
        .pipe(
            $if(
                process.env.NODE_ENV == "production",
                postcss(plugins),
                beautify.css({ indent_size: 4 })
            )
        )
        // Rename
        .pipe(rename(minSuffix))
        // Put sourcemap in public folder
        .pipe(sourcemap.write('.'))
        // Output
        .pipe(dest(`${publicDest}/css`))
);

task("js", () =>
    src("src/js/app.js", { allowEmpty: true })
        // Sourcemaps start
        .pipe(sourcemap.init())
        // ES5 file for uglifing
        .pipe(babel(babelPresets))
        // Minify the file
        .pipe(
            $if(
                process.env.NODE_ENV == "production",
                uglify(),
                beautify.js({ indent_size: 4 })
            )
        )
        // Rename
        .pipe(rename(minSuffix))
        // Put sourcemap in public folder
        .pipe(sourcemap.write('.'))
        // Output
        .pipe(dest(`${publicDest}/js`))
);

task("server", () =>
   src(["*.js", "!*.min.js", "!gulpfile.js", "!config.js"], { allowEmpty: true })
        // ES5 file for uglifing
        .pipe(babel(babelPresets))
        // Minify the file
        .pipe(uglify())
        // Rename
        .pipe(rename(minSuffix))
        // Output
        .pipe(dest('.'))
);

task("config", () =>
    src("config.js", { allowEmpty: true })
        // Edit config
        .pipe(modifyFile(() => `"use strict";module.exports = ${stringify(config)};`))
        // Minify the file
        .pipe(uglify())
        // Rename
        .pipe(rename(minSuffix))
        // Output
        .pipe(dest('.'))
);

task("config:watch", fn => {
    exec("gulp config server html", () => fn())
});

task("git", fn => {
    let gitCommand = [
        "git add .",
        "git commit -m 'Upgrade'",
        "git push -u origin master",
        // "git push heroku master"
    ];

    execSeries(gitCommand, () => fn());
});

// Gulp task to minify all files
task('default', parallel(series("config", "server", "html"), "js", "css"));


// Gulp task to check to make sure a file has changed before minify that file files
task('watch', () => {
    watch('config.js', watchDelay, series('config:watch'));
    watch('views/**/*.pug', watchDelay, series('html'));
    watch('src/**/*.scss', watchDelay, series('css'));
    watch('src/**/*.js', watchDelay, series('js'));
});
