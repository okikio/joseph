let env = process.env;
const { author, homepage, license, copyright, github } = require("./package");
if (!('dev' in env) || !('github_pages' in env)) require('dotenv').config();
let dev = 'dev' in env ? (env.dev.toString() === "false" ? false : true) : true;
let debug = 'debug' in env && env.debug.toString() === "true";
let githubPages = 'github_pages' in env && env.github_pages.toString() === "true";

let _exports = {
    dev, debug, githubPages,
    author, homepage, license, copyright, github,
    "websiteURL": "https://josephojo.com"
};

module.exports = _exports;
