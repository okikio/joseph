let { env } = process;
if (!('dev' in env)) require('dotenv').config();
let dev = 'dev' in env && env.dev.toString() === "true";
let debug = 'debug' in env && env.debug.toString() === "true";
let dontOptimize = 'dontOptimize' in env && env.dontOptimize.toString() === "true";

let _exports = {
    dev, debug, dontOptimize,
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
