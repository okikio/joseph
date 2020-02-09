let { env } = process;
if (!('dev' in env)) require('dotenv').config();
let dev = 'dev' in env && env.dev.toString() === "true";
let debug = 'debug' in env && env.debug.toString() === "true";

let _exports = {
    dev, debug,
    "cloud_name": "okikio-assets",
    "imageURLConfig": {
        "flags": "progressive:steep",
        "fetch_format": "auto",
        "client_hints": true,
        "crop": "scale",
        "quality": 30,
        "dpr": "auto"
    },
    "websiteURL": "https://www.josephojo.com/",
    "class_map": {
        "layer": "lr",
        "layout": "ly",
        "style": "st",
        "margin": "m",
        "padding": "p",
        "header": "h",
        "vert": "v",
        "horz": "h",
        "btn": "b",
        "navbar": "n",
        "title": "t",
        "font": "f",
        "device": "d",
        "primary": "pp",
        "secondary": "s",
        "tertiary": "ty",
        "icon": "i",
        "desktop": "dp",
        "laptop": "lp",
        "tablet": "tt",
        "family": "fam",
        "bold": "em",
        "transition": "trans",
        "phone": "ph",
        "color": "c",
        "-hover": "-hv",
        "-focus": "-fs",
        "placeholder": "plh",
        "left": "lft",
        "right": "rght",
        "top": "tp",
        "bottom": "btm",
        "contain": "cc",
        "center": "ctr",
        "action": "a",
        "dark": "dk",
        "huge": "hg",
        "extra": "xx",
        "sub": "sb",
        "large": "lrg",
        "default": "dlt",
        "small": "sml",
        "-": ""
    },
};

module.exports = _exports;
