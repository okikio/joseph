let path = require('path');
let fs = require("fs");

// Config File
let config = require("./config");

// For faster more efficient page switching
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Render Engine
let engine = (filePath, opts, callback) => {
    let barba = opts.barba, val, dom;
    fs.readFile(filePath, function(err, content) {
        if (err) return callback(err);
        val = content.toString();
        dom = new JSDOM(val).window.document;

        if (barba) {
            dom = dom.querySelector('[data-barba="container"]');
            val = dom.outerHTML;
        }

        return callback(null, val);
    });
};

module.exports.engine = engine;
