const dotenv = require('dotenv');
const { author, homepage, license, copyright, github } = require("./package");

if (process.env.NODE_ENV === "development") {
    dotenv.config();
}

const env = process.env;
const dev = 'dev' in env ? env.dev === "true" : false;
const netlify = 'netlify' in env && env.netlify === "true";
const debug = 'debug' in env && env.debug === "true";
const websiteURL = "https://josephojo.com";

module.exports = { author, homepage, license, copyright, github, env, dev, netlify, debug, websiteURL };
