const minSuffix = { suffix: ".min" };
const mode = process.argv.includes("--watch") ? "watch" : "build";

import { gulpSass, watch, task, tasks, series, parallel, seriesFn, parallelFn, stream, streamList } from "./util.js";
import rename from "gulp-rename";

import { createRequire } from 'module';
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
const tsFolder = `${srcFolder}/ts`;
const pugFolder = `${srcFolder}/pug`;
const scssFolder = `${srcFolder}/scss`;
const assetsFolder = `${srcFolder}/assets`;

// Destination file folders
const jsFolder = `${destFolder}/js`;
const cssFolder = `${destFolder}/css`;
const htmlFolder = `${destFolder}`;

// Main ts file bane
const tsFile = `main.js`;

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
        dest: htmlFolder
    });
});

// CSS Tasks
let browserSync;
task("css", () => {
    return stream(`${scssFolder}/*.scss`, {
        pipes: [
            // Minify scss to css
            gulpSass({ outputStyle: "compressed" })
                .on("error", gulpSass.logError),
            rename(minSuffix), // Rename
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
            { default: gzipSize },
            { default: prettyBytes },
        ] = await Promise.all([
            import("gulp-esbuild"),
            import("gzip-size"),
            import("pretty-bytes"),
        ]);

        let esbuild = mode == "watch" ? createGulpEsbuild() : gulpEsBuild;
        return stream(`${tsFolder}/${tsFile}`, {
            pipes: [
                // Bundle Modules
                esbuild({
                    bundle: true,
                    minify: true,
                    sourcemap: true,
                    outfile: "modern.min.js",
                    target: ["chrome83"],
                }),
            ],
            dest: jsFolder, // Output
            async end() {
                console.log(
                    `=> Gzip size - ${prettyBytes(
                        await gzipSize.file(`${jsFolder}/modern.min.js`)
                    )}\n`
                );
            },
        });
    },
    "legacy-js": async () => {
        let { default: gulpEsBuild, createGulpEsbuild } = await import(
            "gulp-esbuild"
        );
        let esbuild = mode == "watch" ? createGulpEsbuild() : gulpEsBuild;

        return stream(`${tsFolder}/${tsFile}`, {
            pipes: [
                // Bundle Modules
                esbuild({
                    bundle: true,
                    minify: true,
                    outfile: "legacy.min.js",
                    target: ["es6"],
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
        return stream([`${tsFolder}/*.js`, `!${tsFolder}/${tsFile}`], {
            pipes: [
                // Bundle Modules
                esbuild({
                    bundle: true,
                    minify: true,
                    target: ["es6"],
                }),
                rename({ suffix: ".min", extname: ".js" }), // Rename
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

task("posthtml", async () => {
    let [
        { default: posthtml },
        { default: textr },
        { default: lorem },
        { default: singleSpaces },
        { default: sitemap },
    ] = await Promise.all([
        import("gulp-posthtml"),
        import("posthtml-textr"),
        import("posthtml-lorem"),
        import("typographic-single-spaces"),
        import("gulp-sitemap"),
    ]);

    return streamList([
        [[`${htmlFolder}/**/*.html`, `!${htmlFolder}/**/404.html`], {
            pipes: [
                posthtml([
                    // Test processes
                    textr({}, [singleSpaces]),
                    lorem(),
                ]),
            ],
            dest: htmlFolder
        }],
        [`${htmlFolder}/**/*.html`, {
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
        }],
    ]);
});

// BrowserSync
task("reload", () => {
    if (browserSync) browserSync.reload();
    delete require.cache[iconResolve];
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
            online: true,
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
        [`${pugFolder}/pages/**/*.pug`],
        series(`html`, "reload")
    );
    watch(
        [
            `${pugFolder}/layout.pug`,
            `${pugFolder}/components/**/*.pug`,
            iconPath,
        ],
        series(`html`, "reload")
    );
    watch(`${scssFolder}/**/*.scss`, series(`css`));
    watch(
        [`${tsFolder}/**/*.js`, `!${tsFolder}/*.js`, `${tsFolder}/${tsFile}`],
        series(parallelFn(`modern-js`, `legacy-js`), `reload`)
    );
    watch(
        [`!${tsFolder}/${tsFile}`, `${tsFolder}/*.js`],
        series(`other-js`, `reload`)
    );
    watch(`${assetsFolder}/**/*`, { delay: 500 }, series(`assets`, "reload"));
});

// Build & Watch Tasks
task(
    "build",
    series(
        parallelFn("html", "js", "css", "assets"),
        parallelFn("posthtml", "production")
    )
);

task(
    "default",
    series(
        parallelFn("html", "css", "js", "assets"),
        parallelFn("posthtml", "watch")
    )
);