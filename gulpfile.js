const { src, task, series, dest, watch } = require('gulp');
const autoprefixer = require('autoprefixer');
const sourcemap = require('gulp-sourcemaps');
const { exec } = require('child_process');
const beautify = require('gulp-beautify');
const htmlmin = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const cssnano = require('cssnano');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const $if = require('gulp-if');

let minify = uglify();
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

let minSuffix = rename({ suffix: ".min" });
let watchDelay = { delay: 500 };
let publicDest = 'public';
let babelPresets = babel({
    presets: ['@babel/env']
});

task('html', fn => {
    config = require('./config.min');
    for (let i in config.pages)
        src('views/app.pug')
            // Pug compiler
            .pipe(pug({
                data: config.pages[i]
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
    return fn();
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
        .pipe(minSuffix)
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
        .pipe(babelPresets)
        // Minify the file
        .pipe(
            $if(
                process.env.NODE_ENV == "production",
                minify,
                beautify.js({ indent_size: 4 })
            )
        )
        // Rename
        .pipe(minSuffix)
        // Put sourcemap in public folder
        .pipe(sourcemap.write('.'))
        // Output
        .pipe(dest(`${publicDest}/js`))
);

task("server", () =>
   src(["*.js", "!*.min.js", "!gulpfile.js"], { allowEmpty: true })
        // ES5 file for uglifing
        .pipe(babelPresets)
        // Minify the file
        .pipe(minify)
        // Rename
        .pipe(minSuffix)
        // Output
        .pipe(dest('.'))
);

task("git", fn => {
    let gitCommand = `
        git add -A &&
        git commit -m "Upgrade" &&
        git push origin master &&
        git push heroku master
    `;
    let process = exec(gitCommand);
    process.stdout.on('data', data => console.log(data));
    res.on("end", () => fn());
});

// Gulp task to minify all files
task('default', series(['server', 'html', 'css', 'js'], fn => fn()) );

// Gulp task to check to make sure a file has changed before minify that file files
task('watch', () => {
    watch('views/**/*.pug', watchDelay, ['html']);
    watch('src/**/*.scss', watchDelay, ['css']);
    watch('config.js', watchDelay, ['server']);
    watch('src/**/*.js', watchDelay, ['js']);
});
