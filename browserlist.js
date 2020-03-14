let browserlist = {
    "modern": ["> 2%"],
    "general": ["defaults, IE 8"]
};

module.exports = { 
    "babelConfig": {
        "modern": {
            "babelrc": false,
            "presets": [
                ["@babel/preset-env", {
                    "useBuiltIns": false,
                    "modules": 'false',
                    "targets": {
                        "browsers": browserlist.modern
                    }
                }]
            ]
        },
        "node": {
            "presets": ["@babel/preset-env"]
        }
    }, 
    ...browserlist 
};