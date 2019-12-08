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
    "websiteURL": "https://app-web.netlify.com/",
    "pages": {
        "404": {
            "page": {
                "title": "Ooops!",
                "tabs": {
                    "values": [{
                        "a": {
                            "href": "/about.html",
                            "content": "about"
                        }
                    }, {
                        "a": {
                            "href": "/projects.html",
                            "content": "projects"
                        }
                    }, {
                        "a": {
                            "href": "/contact.html",
                            "content": "contact"
                        }
                    }]
                },
                "name": "404",
                "values": [{
                    "layer": {
                        "class": "layout-padding-horz layout-enlarge-vert header-top-spot",
                        "layout": {
                            "class": "layout-contain-small",
                            "values": [{
                                "section": {
                                    "title": "404, Page Not Found.",
                                    "type": "header"
                                }
                            }, {
                                "section": {
                                    "class": "style-center",
                                    "values": ["Sorry, the page you are looking for doesn't exist. How about going back ", {
                                        "a": {
                                            "href": "/index.html",
                                            "content": "home"
                                        }
                                    }, "."],
                                    "type": "main"
                                }
                            }]
                        }
                    }
                }, {
                    "layer": {
                        "class": "footer",
                        "layout": {
                            "section": {
                                "class": "layout-padding style-center style-spaceout-small style-font-weight-bold style-font-title",
                                "values": ["Made with ❤ by Okiki Ojo."]
                            }
                        }
                    }
                }],
                "noFooter": true
            }
        },
        "offline": {
            "page": {
                "title": "Yikes you're offline!",
                "tabs": {
                    "values": [{
                        "a": {
                            "href": "/about.html",
                            "content": "about"
                        }
                    }, {
                        "a": {
                            "href": "/projects.html",
                            "content": "projects"
                        }
                    }, {
                        "a": {
                            "href": "/contact.html",
                            "content": "contact"
                        }
                    }]
                },
                "name": "offline",
                "values": [{
                    "layer": {
                        "class": "layout-padding-horz layout-enlarge-vert header-top-spot",
                        "layout": {
                            "class": "layout-contain-small",
                            "values": [{
                                "section": {
                                    "title": "Yikes you're offline!",
                                    "type": "header"
                                }
                            }, {
                                "section": {
                                    "class": "style-center",
                                    "values": ["Psshhh, psshhh, you are cutting off, psshhh. You have disconnected from the internet. Reload the page or try again later."],
                                    "type": "main"
                                }
                            }]
                        }
                    }
                }, {
                    "layer": {
                        "class": "footer",
                        "layout": {
                            "section": {
                                "class": "layout-padding style-center style-spaceout-small style-font-weight-bold style-font-title",
                                "values": ["Made with ❤ by Okiki Ojo."]
                            }
                        }
                    }
                }],
                "noFooter": true
            }
        },
        "contact": {
            "page": {
                "title": "Contact",
                "tabs": {
                    "values": [{
                        "a": {
                            "href": "/about.html",
                            "content": "about"
                        }
                    }, {
                        "a": {
                            "href": "/projects.html",
                            "content": "projects"
                        }
                    }, {
                        "a": {
                            "href": "/contact.html",
                            "content": "contact"
                        }
                    }]
                },
                "name": "contact",
                "values": [{
                    "hero": {
                        "title": "Contact.",
                        "content": "...",
                        "img": {
                            "src": "/assets/engineer-piping",
                            "alt": "A city Image",
                            "class": "effect-parallax hero-img"
                        }
                    }
                }, {
                    "layer": {
                        "class": "layout-padding-horz",
                        "layout": {
                            "class": "layout-shorten layout-contain",
                            "values": [{
                                "section": {
                                    "title": "Lorem Iptsium",
                                    "type": "header"
                                }
                            }, {
                                "section": {
                                    "values": ["Github: ", {
                                        "a": {
                                            "href": "/index.html",
                                            "content": "home"
                                        }
                                    }, "<br>", "Youtube: ", {
                                        "a": {
                                            "href": "/index.html",
                                            "content": "home"
                                        }
                                    }],
                                    "type": "main"
                                }
                            }, {
                                "section": {
                                    "values": [{
                                        "content": " ",
                                        "class": "layout-padding-top layout-margin-left-large layout-inline-block"
                                    }, "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer\n                                        took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.\n                                        It was popularised in the 1960s with the release of Letraset sheets\n                                        containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum, ", {
                                        "a": {
                                            "href": "/index.html",
                                            "content": "home"
                                        }
                                    }],
                                    "type": "main"
                                }
                            }, {
                                "section": {
                                    "title": "Lorem Iptsium",
                                    "type": "header"
                                }
                            }, {
                                "section": {
                                    "values": ["Github: ", {
                                        "a": {
                                            "href": "/index.html",
                                            "content": "home"
                                        }
                                    }, "<br>", "Youtube: ", {
                                        "a": {
                                            "href": "/index.html",
                                            "content": "home"
                                        }
                                    }],
                                    "type": "main"
                                }
                            }, {
                                "section": {
                                    "values": [{
                                        "content": " ",
                                        "class": "layout-padding-top layout-margin-left-large layout-inline-block"
                                    }, "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer\n                                        took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.\n                                        It was popularised in the 1960s with the release of Letraset sheets\n                                        containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum, ", {
                                        "a": {
                                            "href": "/index.html",
                                            "content": "home"
                                        }
                                    }],
                                    "type": "main"
                                }
                            }]
                        }
                    }
                }, {
                    "layer": {
                        "class": "footer",
                        "layout": {
                            "section": {
                                "class": "layout-padding style-center style-spaceout-small style-font-weight-bold style-font-title",
                                "values": ["Made with ❤ by Okiki Ojo."]
                            }
                        }
                    }
                }],
                "noFooter": true
            }
        },
        "projects": {
            "page": {
                "title": "Projects",
                "tabs": {
                    "values": [{
                        "a": {
                            "href": "/about.html",
                            "content": "about"
                        }
                    }, {
                        "a": {
                            "href": "/projects.html",
                            "content": "projects"
                        }
                    }, {
                        "a": {
                            "href": "/contact.html",
                            "content": "contact"
                        }
                    }]
                },
                "banner": true,
                "name": "projects",
                "values": [{
                    "hero": {
                        "title": "Projects.",
                        "content": "...",
                        "img": {
                            "src": "/assets/blue-sky",
                            "alt": "A city Image",
                            "class": "effect-parallax hero-img"
                        }
                    }
                }, {
                    "layer": {
                        "class": "layout-padding-horz",
                        "layout": {
                            "class": "layout-shorten layout-contain",
                            "values": [{
                                "section": {
                                    "title": "Lorem itpsuim",
                                    "type": "header"
                                }
                            }, {
                                "section": {
                                    "values": [{
                                        "content": " ",
                                        "class": "layout-padding-top layout-margin-left-large layout-inline-block"
                                    }, "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer\n                                        took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.\n                                        It was popularised in the 1960s with the release of Letraset sheets\n                                        containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum, ", {
                                        "a": {
                                            "href": "/index.html",
                                            "content": "home"
                                        }
                                    }],
                                    "type": "main"
                                }
                            }]
                        }
                    }
                }, {
                    "layer": {
                        "class": "footer",
                        "layout": {
                            "section": {
                                "class": "layout-padding style-center style-spaceout-small style-font-weight-bold style-font-title",
                                "values": ["Made with ❤ by Okiki Ojo."]
                            }
                        }
                    }
                }],
                "noFooter": true
            }
        },
        "about": {
            "page": {
                "title": "The Sub Page",
                "tabs": {
                    "values": [{
                        "a": {
                            "href": "/about.html",
                            "content": "about"
                        }
                    }, {
                        "a": {
                            "href": "/projects.html",
                            "content": "projects"
                        }
                    }, {
                        "a": {
                            "href": "/contact.html",
                            "content": "contact"
                        }
                    }]
                },
                "name": "about",
                "values": [{
                    "hero": {
                        "title": "Subpage.",
                        "content": "...",
                        "img": {
                            "src": "/assets/white-flower",
                            "alt": "A city Image",
                            "class": "effect-parallax hero-img"
                        }
                    }
                }, {
                    "layer": {
                        "class": "layout-padding-horz",
                        "layout": {
                            "class": "layout-shorten layout-contain",
                            "values": [{
                                "section": {
                                    "title": "Lorem itpsuim",
                                    "type": "header"
                                }
                            }, {
                                "section": {
                                    "values": [{
                                        "content": " ",
                                        "class": "layout-padding-top layout-margin-left-large layout-inline-block"
                                    }, "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer\n                                        took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.\n                                        It was popularised in the 1960s with the release of Letraset sheets\n                                        containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum, ", {
                                        "a": {
                                            "href": "/index.html",
                                            "content": "home"
                                        }
                                    }],
                                    "type": "main"
                                }
                            }]
                        }
                    }
                }, {
                    "layer": {
                        "class": "footer",
                        "layout": {
                            "section": {
                                "class": "layout-padding style-center style-spaceout-small style-font-weight-bold style-font-title",
                                "values": ["Made with ❤ by Okiki Ojo."]
                            }
                        }
                    }
                }],
                "noFooter": true
            }
        },
        "index": {
            "page": {
                "title": "Hello There",
                "tabs": {
                    "values": [{
                        "a": {
                            "href": "/about.html",
                            "content": "about"
                        }
                    }, {
                        "a": {
                            "href": "/projects.html",
                            "content": "projects"
                        }
                    }, {
                        "a": {
                            "href": "/contact.html",
                            "content": "contact"
                        }
                    }]
                },
                "name": "index",
                "values": [{
                    "hero": {
                        "title": "Brilliant <br/> Engineering",
                        "content": "Creating with passion, crafting with love.",
                        "img": {
                            "src": "/assets/closeup-stones",
                            "alt": "A city Image",
                            "class": "effect-parallax hero-img"
                        }
                    }
                }, {
                    "layer": {
                        "class": "layout-padding-horz layout-padding-vert-top-default--device-phone",
                        "layout": {
                            "class": "layout-shorten layout-contain",
                            "values": [{
                                "section": {
                                    "title": "Lorem itpsuim",
                                    "type": "header"
                                }
                            }, {
                                "section": {
                                    "class": "style-font-18--device-phone",
                                    "values": [{
                                        "content": " ",
                                        "class": "layout-padding-top layout-margin-left-large layout-inline-block"
                                    }, "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer\n                                        took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.\n                                        It was popularised in the 1960s with the release of Letraset sheets\n                                        containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum, ", {
                                        "a": {
                                            "href": "/about.html",
                                            "content": "run"
                                        }
                                    }],
                                    "type": "main"
                                }
                            }]
                        }
                    }
                }, {
                    "layer": {
                        "layout": {
                            "class": "layout-padding-horz layout-padding-large-top",
                            "section": {
                                "class": "layout-shorten layout-contain",
                                "values": [{
                                    "section": {
                                        "title": "Listings",
                                        "type": "header"
                                    }
                                }, {
                                    "section": {
                                        "class": "layout-padding-top style-line-height-double",
                                        "values": [{
                                            "row": {
                                                "values": [{
                                                    "col": {
                                                        "class": "layout-col-2 layout-padding-bottom-small",
                                                        "values": [{
                                                            "content": "03/03",
                                                            "class": "style-bold style-font-24 style-font-weight-bold"
                                                        }]
                                                    }
                                                }, {
                                                    "col": {
                                                        "class": "layout-col-3 layout-padding-bottom",
                                                        "values": [{
                                                            "content": "2018",
                                                            "class": "style-line-height-double style-bold layout-block style-font-24 style-font-weight-bold"
                                                        }, {
                                                            "content": "E-commerse",
                                                            "class": "style-line-height-double layout-block style-font-18"
                                                        }, {
                                                            "content": "Design Executive",
                                                            "class": "style-line-height-double layout-block style-font-18"
                                                        }]
                                                    }
                                                }, {
                                                    "col": {
                                                        "class": "layout-col-7",
                                                        "values": [{
                                                            "content": "Lorem Ipsum is simply dummy text of the printing and typesetting industry.\n                                                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an\n                                                        unknown printer took a galley of type and scrambled it to make a type specimen book.",
                                                            "class": "style-line-height-double style-font-18"
                                                        }]
                                                    }
                                                }]
                                            }
                                        }],
                                        "type": "main"
                                    }
                                }]
                            }
                        }
                    }
                }, {
                    "layer": {
                        "layout": {
                            "class": "layout-padding-horz layout-padding-vert-large layout-contain-large",
                            "values": [{
                                "section": {
                                    "title": "",
                                    "class": "layout-vert style-bold-font style-600 h2",
                                    "values": ["Got your attention.", " ", {
                                        "content": "Good!",
                                        "class": "style-color-primary"
                                    }],
                                    "type": "header"
                                }
                            }]
                        }
                    }
                }, {
                    "layer": {
                        "class": "layer-color-primary",
                        "layout": {
                            "class": "layout-contain-large layout-enlarge-vert",
                            "values": [{
                                "section": {
                                    "title": "",
                                    "class": "layout-vert style-bold-font style-600 h2 style-color-white",
                                    "values": ["Got your attention.", " ", {
                                        "content": "Good!",
                                        "class": "style-color-tertiary-dark"
                                    }],
                                    "type": "header"
                                }
                            }]
                        }
                    }
                }, {
                    "layer": {
                        "class": "layer-color-tertiary",
                        "layout": {
                            "class": "layout-contain-large layout-enlarge-vert",
                            "values": [{
                                "section": {
                                    "title": "",
                                    "class": "layout-vert style-bold-font style-600 h2 style-color-dark",
                                    "values": ["Got your attention.", " ", {
                                        "content": "Good!",
                                        "class": "style-color-secondary-dark"
                                    }],
                                    "type": "header"
                                }
                            }]
                        }
                    }
                }, {
                    "layer": {
                        "layout": {
                            "class": "layout-contain-large layout-padding-horz layout-padding-large",
                            "values": [{
                                "section": {
                                    "class": "layout-vert",
                                    "values": [{
                                        "row": {
                                            "values": [{
                                                "col": {
                                                    "class": "layout-col-6 layout-padding-bottom-small layout-padding-right-large",
                                                    "values": [{
                                                        "content": "Breakthrough<br>Limits!",
                                                        "class": "style-bold style-line-height style-600 h3 style-color-primary"
                                                    }]
                                                }
                                            }, {
                                                "col": {
                                                    "class": "layout-col-6",
                                                    "values": [{
                                                        "content": "Lorem Ipsum is simply dummy text of the printing and typesetting industry.\n                                                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an\n                                                        unknown printer took a galley of type and scrambled it to make a type specimen book.",
                                                        "class": "layout-block style-line-height-double style-font-18"
                                                    }]
                                                }
                                            }]
                                        }
                                    }],
                                    "type": "main"
                                }
                            }]
                        }
                    }
                }, {
                    "layer": {
                        "layout": {
                            "class": "layout-contain-large",
                            "values": [{
                                "section": {
                                    "class": "layout-shorten-vert",
                                    "values": [{
                                        "row": {
                                            "class": "layout-margin-dull",
                                            "values": [{
                                                "col": {
                                                    "class": "layout-block layout-col-3"
                                                }
                                            }, {
                                                "col": {
                                                    "class": "layout-col-9 layout-padding-small",
                                                    "values": [{
                                                        "tile": {
                                                            "title": "Google Designs",
                                                            "content": "",
                                                            "img": {
                                                                "src": "/assets/city",
                                                                "alt": "City Alt",
                                                                "class": "effect-parallax"
                                                            },
                                                            "class": "layer-box layer-surface layout-block"
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    }, {
                                        "row": {
                                            "class": "layout-margin-dull",
                                            "values": [{
                                                "col": {
                                                    "class": "layout-col-9 layout-padding-small layout-padding-vert-large",
                                                    "values": [{
                                                        "tile": {
                                                            "title": "Google Designs",
                                                            "content": "",
                                                            "img": {
                                                                "src": "/assets/blue-sky",
                                                                "alt": "Blue sky Alt",
                                                                "class": ""
                                                            },
                                                            "class": "layer-box layer-surface layout-block"
                                                        }
                                                    }]
                                                }
                                            }, {
                                                "col": {
                                                    "class": "layout-block layout-col-3"
                                                }
                                            }]
                                        }
                                    }],
                                    "type": "main"
                                }
                            }]
                        }
                    }
                }, {
                    "layer": {
                        "layout": {
                            "class": "",
                            "values": [{
                                "section": {
                                    "values": [{
                                        "row": {
                                            "class": "layout-margin-dull",
                                            "values": [{
                                                "col": {
                                                    "class": "layout-col-12 layout-padding-dull",
                                                    "values": [{
                                                        "tile": {
                                                            "title": "",
                                                            "content": "",
                                                            "img": {
                                                                "src": "/assets/footsteps-sand",
                                                                "alt": "Foot Step Alt",
                                                                "class": "effect-parallax"
                                                            },
                                                            "class": "layer-box layer-box-flat layer-box-mid layer-surface layout-block"
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    }],
                                    "type": "main"
                                }
                            }]
                        }
                    }
                }, {
                    "layer": {
                        "class": "layer-color-dark",
                        "layout": {
                            "class": "layout-contain layout-padding-horz layout-padding-top",
                            "values": [{
                                "section": {
                                    "class": "h4 layout-shorten",
                                    "values": [{
                                        "section": {
                                            "title": "Next",
                                            "class": "style-color-white style-font-light style-font-thin style-spaceout",
                                            "type": "header"
                                        }
                                    }, {
                                        "section": {
                                            "class": "style-center layout-padding-vert",
                                            "values": [{
                                                "content": "NASA Rocket Ship",
                                                "class": "h1 style-bold style-tertiary style-500"
                                            }],
                                            "type": "main"
                                        }
                                    }]
                                }
                            }, {
                                "section": {
                                    "class": "layer-box layer-box-flat layer-tertiary-dark layer-shadow--1 layout-block"
                                }
                            }]
                        }
                    }
                }],
                "noFooter": true
            }
        }
    }
};