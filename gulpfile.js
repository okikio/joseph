const minSuffix = { suffix: ".min" };
const mode = process.argv.includes("--watch") ? "watch" : "build";

import { watch, task, tasks, series, parallel, seriesFn, parallelFn, stream, streamList } from "./util.js";

import { createRequire } from 'module';
import rename from "gulp-rename";
const require = createRequire(import.meta.url);

const dotenv = "siteUrl" in process.env
    ? process.env
    : require("dotenv");
if (typeof dotenv.config === "function") dotenv.config();

const env = process.env;
const siteUrl = "siteUrl" in env ? env.siteUrl : "https://josephojo.com";

// Origin folders (source and destination folders)
const srcFolder = `src`;
const destFolder = `public`;

// Source file folders
const srcjsFolder = `${srcFolder}/js`;
const pugFolder = `${srcFolder}/pug`;
const scssFolder = `${srcFolder}/scss`;
const assetsFolder = `${srcFolder}/assets`;

// Destination file folders
const jsFolder = `${destFolder}/js`;
const cssFolder = `${destFolder}/css`;
const htmlFolder = `${destFolder}`;

// Main ts file bane
const jsFile = `main.js`;

// HTML Tasks
const iconPath = `./icons.cjs`;
const iconResolve = require.resolve(iconPath);
const pugConfig = {
    pretty: false,
    basedir: pugFolder,
    self: true,
};

task("html", async () => {
    const [
        { default: plumber },
        { default: pug },
        { default: minifyJSON }
    ] = await Promise.all([
        import("gulp-plumber"),
        import("gulp-pug"),
        import('gulp-minify-inline-json')
    ]);

    let icons = require(iconResolve);
    return stream(`${pugFolder}/pages/**/*.pug`, {
        pipes: [
            plumber(), // Recover from errors without cancelling build task
            // Compile src html using Pug
            pug({
                ...pugConfig,
                data: { icons },
            }),

            minifyJSON(), // Minify application/ld+json
        ],
        end() {
            delete require.cache[iconResolve];
        },
        dest: htmlFolder
    });
});

// CSS Tasks
let browserSync;
task("css", async () => {
    const [
        { default: fiber },

        { default: postcss },
        { default: tailwind },

        { default: _import },

        { default: scss },
        { default: sass },
    ] = await Promise.all([
        import("fibers"),

        import("gulp-postcss"),
        import("tailwindcss"),

        import("postcss-easy-import"),

        import("postcss-scss"),
        import("@csstools/postcss-sass"),
    ]);

    // sass.compiler = compiler;
    return stream(`${scssFolder}/*.scss`, {
        pipes: [
            postcss([
                _import(),
                sass({
                    outputStyle: "compressed",
                    fiber
                }),
                tailwind("./tailwind.config.cjs"),
            ], { syntax: scss }),
            rename({ extname: ".min.css" }), // Rename
        ],
        dest: cssFolder,
        end: browserSync ? [browserSync.stream()] : undefined,
    });
});

// JS tasks
tasks({
    "modern-js": async () => {
        let [
            { default: gulpEsBuild, createGulpEsbuild },
            { default: size },
            { default: gulpif }
        ] = await Promise.all([
            import("gulp-esbuild"),
            import("gulp-size"),
            import("gulp-if")
        ]);

        let esbuild = mode == "watch" ? createGulpEsbuild() : gulpEsBuild;
        return stream(`${srcjsFolder}/${jsFile}`, {
            pipes: [
                // Bundle Modules
                esbuild({
                    bundle: true,
                    minify: true,
                    sourcemap: true,
                    format: "esm",
                    platform: "browser",
                    target: ["es2018"],
                    outfile: "modern.min.js",
                }),

                // Filter out the sourcemap
                // I don't need to know the size of the sourcemap
                gulpif(
                    (file) => !/\.map$/.test(file.path),
                    size({ gzip: true, showFiles: true, showTotal: false })
                )
            ],
            dest: jsFolder, // Output
        });
    },
    "legacy-js": async () => {
        let { default: gulpEsBuild, createGulpEsbuild } = await import(
            "gulp-esbuild"
        );

        let esbuild = mode == "watch" ? createGulpEsbuild() : gulpEsBuild;
        return stream(`${srcjsFolder}/${jsFile}`, {
            pipes: [
                // Bundle Modules
                esbuild({
                    bundle: true,
                    minify: true,
                    outfile: "legacy.min.js",
                    target: ["es6"],
                    format: "iife",
                    platform: "browser",
                }),
            ],
            dest: jsFolder, // Output
        });
    },
    "other-js": async () => {
        let { default: gulpEsBuild, createGulpEsbuild } = await import(
            "gulp-esbuild"
        );
        let esbuild = mode == "watch" ? createGulpEsbuild() : gulpEsBuild;
        return stream([`${srcjsFolder}/*.js`, `!${srcjsFolder}/${jsFile}`], {
            pipes: [
                // Bundle Modules
                esbuild({
                    bundle: true,
                    minify: true,
                    entryNames: '[name].min',
                    target: ["es6"],
                    format: "iife",
                    platform: "browser",
                }),
            ],
            dest: jsFolder, // Output
        });
    },
    js: parallelFn(`modern-js`, `legacy-js`, `other-js`),
});

// Task for Optimizing for Production
task("production", async () => {
    let [
        { default: typescript },
        { default: terser },

        { default: postcss },
        { default: autoprefixer },
        { default: csso },
        { default: purgecss },
    ] = await Promise.all([
        import("gulp-typescript"),
        import("gulp-terser"),

        import("gulp-postcss"),
        import("autoprefixer"),
        import("postcss-csso"),
        import("@fullhuman/postcss-purgecss"),
    ]);

    return streamList([
        [[`${jsFolder}/*.js`, `!${jsFolder}/modern.min.js`], {
            pipes: [
                // Support for es5
                typescript({
                    target: "ES5",
                    allowJs: true,
                    checkJs: false,
                    noEmit: true,
                    noEmitOnError: true,
                    sourceMap: false,
                    declaration: false,
                    isolatedModules: true,
                }),

                // Minify
                terser({
                    keep_fnames: false, // change to true here
                    toplevel: true,
                    compress: false,
                    ecma: 5,
                }),
            ],
            dest: jsFolder, // Output
        }],

        [`${cssFolder}/*.css`, {
            pipes: [
                postcss([
                    // Purge, Compress & Prefix CSS
                    purgecss({
                        content: [`${htmlFolder}/**/*.html`],
                        safelist: ["active", "show", "focus", "hide", /-show$/, /-initial$/, /-hide$/, /navbar-focus/, /navbar-link-focus/, /btn-expand/, /at-top/],
                        keyframes: false,
                        fontFace: false,
                    }),
                    csso(),
                    autoprefixer(),
                ]),
            ],
            dest: cssFolder,
        }]
    ]);
});

// Other assets
task("assets", () => {
    return stream(`${assetsFolder}/**/*`, {
        opts: {
            base: assetsFolder,
        },
        dest: destFolder,
    });
});

task("sitemap", async () => {
    let [
        { default: sitemap },
    ] = await Promise.all([
        import("gulp-sitemap"),
    ]);

    return stream(`${htmlFolder}/**/*.html`, {
        pipes: [
            sitemap({
                siteUrl,
                mappings: [
                    {
                        pages: ["**/*"],
                        changefreq: "monthly",
                        getLoc(siteUrl, loc, entry) {
                            // Removes the file extension if it exists
                            return loc.replace(/\.\w+$/, "");
                        },
                    },
                ],
            }),
        ],
        dest: htmlFolder,
    });
});

// Delete destFolder for added performance
task("clean", async () => {
    const { default: del } = await import("del");
    return del(destFolder);
});

// BrowserSync
task("reload", () => {
    if (browserSync) browserSync.reload();
    return Promise.resolve();
});

task("watch", async () => {
    const { default: bs } = await import("browser-sync");
    browserSync = bs.create();
    browserSync.init(
        {
            notify: true,
            server: {
                baseDir: destFolder,
                serveStaticOptions: {
                    cacheControl: false,
                    extensions: ["html"],
                },
            },
            
            browser: "chrome",
            scrollThrottle: 250,
        },
        (_err, bs) => {
            bs.addMiddleware("*", (_req, res) => {
                res.writeHead(302, {
                    location: `/404`,
                });
                res.end("404 Error");
            });
        }
    );

    watch(
        [
            `${pugFolder}/pages/**/*.pug`,
            `${pugFolder}/layout.pug`,
            `${pugFolder}/components/**/*.pug`,
            iconPath,
        ],
        { delay: 300 },
        series(`html`, "reload")
    );

    watch([`${scssFolder}/**/*`, "tailwind.config.cjs"], series(`css`));
    watch(
        [`${srcjsFolder}/${jsFile}`, `${srcjsFolder}/components/*.js`],
        series(`modern-js`, `legacy-js`, `reload`)
    );

    watch(
        [`!${srcjsFolder}/${jsFile}`, `${srcjsFolder}/*.js`],
        series(`other-js`, `reload`)
    );

    watch(`${assetsFolder}/**/*`, { delay: 500 }, series(`assets`, "reload"));
});

// Build & Watch Tasks
task(
    "build",
    series(
        "clean",
        parallelFn("html", "css", "js", "assets"),
        parallelFn("production", "sitemap")
    )
);

task(
    "default",
    series(
        "clean",
        parallelFn("html", "css", "js", "assets"),
        "watch"
    )
);