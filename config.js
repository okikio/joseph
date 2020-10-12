import dotenv from 'dotenv';

if (process.env.NODE_ENV === "development") {
    dotenv.config();
}

export const env = process.env;
export const dev = 'dev' in env ? env.dev === "true" : false;
export const netlify = 'netlify' in env && env.netlify === "true";
export const debug = 'debug' in env && env.debug === "true";
export const websiteURL = "https://josephojo.com";
export { author, homepage, license, copyright, github } from "./package";
