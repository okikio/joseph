let { env } = process;
console.log("Process ENV: ", env.dev);
if (!('dev' in env) || !('github_pages' in env)) require('dotenv').config();
let dev = 'dev' in env && env.dev.toString() === "true";
let debug = 'debug' in env && env.debug.toString() === "true";
let githubPages = 'github_pages' in env && env.github_pages.toString() === "true";

let env_vars = { dev, debug, githubPages };
console.log("Enviroment Variables: ", env_vars);
let _exports = {
    ...env_vars,
    "websiteURL": "https://josephojo.com",
    "class_map": {
        // Continue...
        "layer-": "lr",
        "layout-": "ly",
        "align-": "aln",
        "-hero": "hr",
        "-shorten": "shrt",
        "-size": "sz",
        "style-": "st",
        "margin-": "m",
        "padding-": "p",
        "-main": "mn",
        "-vert": "v",
        "-horz": "h",
        "-btn": "b",
        "navbar-": "n",
        "-title": "t",
        "-font": "f",
        "-device": "d",
        "-primary": "pp",
        "-secondary": "s",
        "-tertiary": "ty",
        "-icon": "i",
        "-desktop": "dp",
        "-laptop": "lp",
        "-tablet": "tt",
        "-family": "fam",
        "-bold": "em",
        "-phone": "ph",
        "-color": "c",
        "-hover": "-hv",
        "-focus": "-fs",
        "-placeholder": "plh",
        "-left": "lft",
        "-right": "rght",
        "-top": "tp",
        "-bottom": "btm",
        "-contain": "cc",
        "-center": "ctr",
        "action-": "a",
        "-huge": "hg",
        "-extra": "ex",
        "-large": "lrg",
        "-default": "dlt",
        "-small": "sml"
    },
};

module.exports = _exports;
