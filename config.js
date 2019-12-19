let { attr, section, _img, background, _tile, _col, _style, _layer, _layout, _header, _main, values, title, row, page, padding, margin, _link, layout, layer, _hero, font, _content, color, col, _class } = require('./containers');
let cityImg = "/assets/city";
let blueSkyImg = "/assets/blue-sky";
let carImg = "/assets/closeup-stones";
let flowerImg = "/assets/white-flower";
let footStepImg = "/assets/footsteps-sand";

let _name = attr("name", "index");
let noFooter = attr("noFooter", true);
let newFooter = (value = "Made with ❤ by Okiki Ojo.") => layer([
    _class([ "footer" ]),
    layout([
        section([
            _class([ padding(), _style("center", "spaceout-small"), font("weight-bold", "title") ]),
            values([ value ]),
        ])
    ])
]);

let indent = _content(" ", [
    padding("top"), margin("left-large"),
    _layout("inline-block")
]);

let spacingColumns = size => col([
    _class([ _layout("block"), _col(size.toString()) ])
]);

// Edit this to change your site
module.exports = {
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
    "pages": {
        "offline": page([
            _name("offline"),
            title("Yikes you're offline!"),
            values([
                // Intro layer
                layer([
                    _class([padding("horz"), _layout("enlarge-vert"), "header-top-spot"]),
                    layout([
                        _class([_layout("contain-small")]),
                        values([
                            _header(title("Yikes you're offline!")),
                            _main([
                                _class([_style("center")]),
                                values([
                                    `Psshhh, psshhh, you are cutting off, psshhh. You have disconnected from the internet. Reload the page or try again later.`,
                                ])
                            ])
                        ])
                    ])
                ]),
                // End Intro Layer

                // Footer
                newFooter()
            ]),
            noFooter()
        ]),

        "sitemap": page([
            _name("Sitemap"),
            title("Now lets find you a destination!"),
            values([
                // Intro layer
                layer([
                    _class([padding("horz"), _layout("enlarge-vert"), "header-top-spot"]),
                    layout([
                        _class([_layout("contain-small")]),
                        values([
                            _header(title("The sitemap!")),
                            _main([
                                _class([_style("center")]),
                                values([
                                    _link("home", "/"), " - Homepage galor, its the begining of our little adventure. Do you want to go back?<br>",
                                    _link("about", "/about"), " - The story of me, myself and I. Shall we then?<br>",
                                    _link("projects", "/projects"), " - Hardwork and perseverance, hear all about it.<br>",
                                    _link("contact", "/contact"), " - Call me maybe? How about that, why don't we create something amazing?<br>",
                                ])
                            ])
                        ])
                    ])
                ]),
                // End Intro Layer

                // Footer
                newFooter()
            ]),
            noFooter()
        ]),
        "404": page([
            _name("404"),
            title("Ooops!"),
            values([
                // Intro layer
                layer([
                    _class([padding("horz"), _layout("enlarge-vert"), "header-top-spot" ]),
                    layout([
                        _class([_layout("contain-small") ]),
                        values([
                            _header(title("404, Page Not Found.")),
                            _main([
                                _class([ _style("center") ]),
                                values([
                                    `Sorry, the page you are looking for doesn't exist. How about going back `,
                                    _link("home", "/"), "."
                                ])
                            ])
                        ])
                    ])
                ]),
                // End Intro Layer

                // Footer
                newFooter()
            ]),
            noFooter()
        ]),
        "contact": page([
            _name("contact"),
            title("Contact"),
            values([
                // Hero Layer
                _hero(["Contact.", "...", ["/assets/engineer-piping", "A city Image", [_class("effect-parallax", "hero-img")]]]),
                // End Hero Layer

                // Intro layer
                layer([
                    _class([ padding("horz") ]),
                    layout([
                        _class([ _layout("shorten", "contain") ]),
                        values([
                            _header(title("Lorem Iptsium")),
                            _main([
                                values([
                                    `Github: `, _link("home", "/"), `<br>`,
                                    `Youtube: `, _link("home", "/")
                                ])
                            ]),
                            _main([
                                values([
                                    indent,
                                    `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer
                                        took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                                        It was popularised in the 1960s with the release of Letraset sheets
                                        containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum, `,
                                    _link("home", "/")
                                ])
                            ]),
                            _header(title("Lorem Iptsium")),
                            _main([
                                values([
                                    `Github: `, _link("home", "/"), `<br>`,
                                    `Youtube: `, _link("home", "/")
                                ])
                            ]),
                            _main([
                                values([
                                    indent,
                                    `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer
                                        took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                                        It was popularised in the 1960s with the release of Letraset sheets
                                        containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum, `,
                                    _link("home", "/")
                                ])
                            ])
                        ])
                    ])
                ]),
                // End Intro Layer

                // Footer
                newFooter()
            ]),
            noFooter()
        ]),
        "projects": page([
            attr("banner", true) (),
            _name("projects"),
            title("Projects"),
            values([
                // Hero Layer
                _hero(["Projects.", "...", [blueSkyImg, "A city Image", [_class("effect-parallax", "hero-img")]] ]),
                // End Hero Layer

                // Intro layer
                layer([
                    _class([ padding("horz") ]),
                    layout([
                        _class([ _layout("shorten", "contain") ]),
                        values([
                            _header(title("Lorem itpsuim")),
                            _main([
                                values([
                                    indent,
                                    `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer
                                        took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                                        It was popularised in the 1960s with the release of Letraset sheets
                                        containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum, `,
                                    _link("home", "/")
                                ])
                            ])
                        ])
                    ])
                ]),
                // End Intro Layer

                // Footer
                newFooter()
            ]),
            noFooter()
        ]),
        "about": page([
            _name("about"),
            title("The Sub Page"),
            values([
                // Hero Layer
                _hero(["Subpage.", "...", [flowerImg, "A city Image", [_class("effect-parallax", "hero-img")]] ]),
                // End Hero Layer

                // Intro layer
                layer([
                    _class([ padding("horz") ]),
                    layout([
                        _class([ _layout("shorten", "contain") ]),
                        values([
                            _header(title("Lorem itpsuim")),
                            _main([
                                values([
                                    indent,
                                    `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer
                                        took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                                        It was popularised in the 1960s with the release of Letraset sheets
                                        containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum, `,
                                    _link("home", "/")
                                ])
                            ])
                        ])
                    ])
                ]),
                // End Intro Layer

                // Footer
                newFooter()
            ]),
            noFooter()
        ]),
        "index": page([
            _name(),
            title("Hello There"),
            values([
                // Hero layer
                _hero(["Brilliant <br/> Engineering", "Creating with passion, crafting with love.", [carImg, "A city Image", [_class("effect-parallax", "hero-img")]] ]),
                // End Hero layer

                // Intro layer
                layer([
                    _class([ padding("horz", "vert-top-default--device-phone") ]),
                    layout([
                        _class([_layout("shorten", "contain")]),
                        values([
                            _header(title("Lorem itpsuim")),
                            _main([
                                _class([ font("18--device-phone") ]),
                                values([
                                    indent,
                                    `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer
                                        took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                                        It was popularised in the 1960s with the release of Letraset sheets
                                        containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum, `,
                                    _link("run", "/about")
                                ])
                            ])
                        ])
                    ])
                ]),
                // End Intro layer

                // Listings layer
                layer([
                    layout([
                        _class([ padding("horz", "large-top") ]),
                        section([
                            _class([ _layout("shorten", "contain") ]),
                            values([
                                _header(title("Listings")),
                                _main([
                                    _class([ padding("top"), _style("line-height-double") ]),
                                    values([
                                        row([
                                            values([
                                                col([
                                                    _class([ _col("2"), padding("bottom-small") ]),
                                                    values([
                                                        _content(`03/03`, [_style("bold"), font("24", "weight-bold") ])
                                                    ])
                                                ]),

                                                col([
                                                    _class([ _col("3"), padding("bottom") ]),
                                                    values([
                                                        _content(`2018`, [
                                                            _style("line-height-double", "bold"),
                                                            _layout("block"), font("24", "weight-bold")
                                                        ]),
                                                        _content(`E-commerse`, [
                                                            _style("line-height-double"),
                                                            _layout("block"),
                                                            font("18")
                                                        ]),
                                                        _content(`Design Executive`, [
                                                            _style("line-height-double"),
                                                            _layout("block"), font("18")
                                                        ])
                                                    ])
                                                ]),

                                                col([
                                                    _class([ _col("7"), ]), // _style("justify")
                                                    values([
                                                        _content(`Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an
                                                        unknown printer took a galley of type and scrambled it to make a type specimen book.`,
                                                        [ _style("line-height-double"), font("18") ])
                                                    ])
                                                ])
                                            ])
                                        ])
                                    ])
                                ])
                            ])
                        ])
                    ])
                ]),
                // End Listings layer

                // Banner layer 1
                layer([
                    layout([
                        _class([
                            padding("horz", "vert-large"),
                            _layout("contain-large")
                        ]),
                        values([
                            _header([
                                title(""),
                                _class([ _layout("vert"), _style("bold-font", "600"), "h2" ]),
                                values([
                                    `Got your attention.`, ` `,
                                    _content(`Good!`, [ color("primary") ])
                                ])
                            ])
                        ])
                    ])
                ]),
                // End Banner layer 1

                // Banner layer 2
                layer([
                    _class([ background("primary") ]),
                    layout([
                        _class([ _layout("contain-large", "enlarge-vert") ]),
                        values([
                            _header([
                                title(""),
                                _class([ _layout("vert"), _style("bold-font", "600"), "h2", color("white") ]),
                                values([
                                    `Got your attention.`, ` `,
                                    _content(`Good!`, [ color("tertiary-dark") ])
                                ])
                            ])
                        ])
                    ])
                ]),
                // End Banner layer 2

                // Banner layer 3
                layer([
                    _class([ background("tertiary") ]),
                    layout([
                        _class([ _layout("contain-large", "enlarge-vert") ]),
                        values([
                            _header([
                                title(""),
                                _class([ _layout("vert"), _style("bold-font", "600"), "h2", color("dark") ]),
                                values([
                                    `Got your attention.`, ` `,
                                    _content(`Good!`, [ color("secondary-dark") ])
                                ])
                            ])
                        ])
                    ])
                ]),
                // End Banner layer 3

                // Breakthrough layer
                layer([
                    layout([
                        _class([
                            _layout("contain-large"),
                            padding("horz", "large")
                        ]),
                        values([
                            _main([
                                _class([ _layout("vert") ]),
                                values([
                                    row([
                                        values([
                                            col([
                                                _class([ _col("6"), padding("bottom-small", "right-large") ]),
                                                values([
                                                    _content(`Breakthrough<br>Limits!`, [
                                                        _style("bold", "line-height", "600"),
                                                        "h3", color("primary")
                                                    ])
                                                ])
                                            ]),

                                            col([
                                                _class( _col("6") ),
                                                values([
                                                    _content(`Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an
                                                        unknown printer took a galley of type and scrambled it to make a type specimen book.`,
                                                        [ _layout("block"), _style("line-height-double"), font("18") ])
                                                ])
                                            ])
                                        ])
                                    ])
                                ])
                            ])
                        ])
                    ])
                ]),
                // End Breakthrough layer

                // Image Column layer
                layer([
                    layout([
                        _class([ _layout("contain-large") ]),
                        values([
                            _main([
                                _class([ _layout("shorten-vert") ]),
                                values([
                                    row([
                                        _class([ margin("dull") ]),
                                        values([
                                            spacingColumns(3),

                                            col([
                                                _class([ _col("9"), padding("small") ]),
                                                values([
                                                    _tile([
                                                        "Google Designs", "",
                                                        _img(cityImg, "City Alt", [_class("effect-parallax") ]),
                                                        _class([
                                                            _layer("box", "surface"), // , "shadow--1"
                                                            _layout("block")
                                                        ])
                                                    ])
                                                ])
                                            ])
                                        ])
                                    ]),

                                    row([
                                        _class([ margin("dull") ]),
                                        values([
                                            col([
                                                _class([ _col("9"), padding("small", "vert-large") ]),
                                                values([
                                                    _tile([
                                                        "Google Designs", "",
                                                        _img(blueSkyImg, "Blue sky Alt", [ _class("") ]),
                                                        _class([
                                                            _layer("box", "surface"), // , "shadow--1"
                                                            _layout("block")
                                                        ])
                                                    ])
                                                ])
                                            ]),

                                            spacingColumns(3),
                                        ])
                                    ])
                                ])
                            ])
                        ])
                    ])
                ]),
                // End Image Column layer

                // Image Banner layer
                layer([
                    layout([
                        _class([]),
                        values([
                            _main([
                                values([
                                    row([
                                        _class([ margin("dull") ]),
                                        values([
                                            col([
                                                _class([ _col("12"), padding("dull") ]),
                                                values([
                                                    _tile([ "", "",
                                                        _img(footStepImg, "Foot Step Alt", [_class("effect-parallax", "layer-box-tall")]),
                                                        _class([
                                                            _layer("box", "box-flat", "surface"), // , "shadow--2"
                                                            _layout("block")
                                                        ])
                                                    ])
                                                ])
                                            ])
                                        ])
                                    ]),
                                ])
                            ])
                        ])
                    ])
                ]),
                // End Image Banner layer

                // Footer
                // newFooter(),

                // Next Page layer
                layer([
                    _class([ background("dark") ]),
                    layout([
                        _class([ _layout("contain"), padding("horz", "top") ]),
                        values([
                            section([
                                _class([ "h4", _layout("shorten") ]),
                                values([
                                    _header([
                                        title("Next"),
                                        _class([ color("white"), font("light", "thin"), _style("spaceout") ])
                                    ]),
                                    _main([
                                        _class([ _style("center"), padding("vert") ]),
                                        values([
                                            _content(`NASA Rocket Ship`, [ "h1", _style("bold", "tertiary", "500") ]),
                                        ])
                                    ])

                                ])
                            ]),
                            section([
                                _class([
                                    _layer("box", "box-flat", "tertiary-dark", "shadow--1"),
                                    _layout("block")
                                ])
                            ])

                        ])
                    ])
                ]),
                // End Next Page layer
            ]),
            noFooter()
        ])
    }
};
