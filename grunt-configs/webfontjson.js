// Create JSON web font files from fonts. See https://github.com/ahume/grunt-webfontjson

module.exports = function(grunt, options) {
    return {
        GuardianTextEgyptianWebWoff2: {
            options: {
                filename: options.staticTargetDir + 'fonts/GuardianTextEgyptianWeb.woff2.json',
                callback: 'guFont',
                fonts: [
                    {
                        'font-family': '"Guardian Text Egyptian Web"',
                        file: options.webfontsDir + 'hinting-off/kerning-on/original/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-Regular.woff2',
                        format: 'woff'
                    },
                    {
                        'font-family': '"Guardian Text Egyptian Web"',
                        'font-style': 'italic',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-RegularItalic.woff2',
                        format: 'woff'
                    },
                    {
                        'font-family': '"Guardian Text Egyptian Web"',
                        'font-weight': '700',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-Medium.woff2',
                        format: 'woff'
                    }
                ]
            }
        },
        GuardianTextEgyptianWebWoff: {
            options: {
                filename: options.staticTargetDir + 'fonts/GuardianTextEgyptianWeb.woff.json',
                callback: 'guFont',
                fonts: [
                    {
                        'font-family': '"Guardian Text Egyptian Web"',
                        file: options.webfontsDir + 'hinting-off/kerning-on/original/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-Regular.woff',
                        format: 'woff'
                    },
                    {
                        'font-family': '"Guardian Text Egyptian Web"',
                        'font-style': 'italic',
                        file: options.webfontsDir + 'hinting-off/kerning-on/ascii/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-RegularItalic.woff',
                        format: 'woff'
                    },
                    {
                        'font-family': '"Guardian Text Egyptian Web"',
                        'font-weight': '700',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-Medium.woff',
                        format: 'woff'
                    }
                ]
            }
        },
        GuardianTextEgyptianWebTtf: {
            options: {
                filename: options.staticTargetDir + 'fonts/GuardianTextEgyptianWeb.ttf.json',
                callback: 'guFont',
                fonts: [
                    {
                        'font-family': '"Guardian Text Egyptian Web"',
                        file: options.webfontsDir + 'hinting-off/kerning-on/original/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-Regular.ttf',
                        format: 'ttf'
                    },
                    {
                        'font-family': '"Guardian Text Egyptian Web"',
                        'font-style': 'italic',
                        file: options.webfontsDir + 'hinting-off/kerning-on/ascii/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-RegularItalic.ttf',
                        format: 'ttf'
                    },
                    {
                        'font-family': '"Guardian Text Egyptian Web"',
                        'font-weight': '700',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-Medium.ttf',
                        format: 'ttf'
                    }
                ]
            }
        },
        GuardianEgyptianWebWoff2: {
            options: {
                filename: options.staticTargetDir + 'fonts/GuardianEgyptianWeb.woff2.json',
                callback: 'guFont',
                fonts: [
                    {
                        'font-family': '"Guardian Egyptian Web"',
                        'font-weight': '200',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianEgyptianWeb/GuardianEgyptianWeb-Light.woff2',
                        format: 'woff'
                    },
                    {
                        'font-family': '"Guardian Egyptian Web"',
                        'font-weight': '400',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianEgyptianWeb/GuardianEgyptianWeb-Regular.woff2',
                        format: 'woff'
                    },
                    {
                        'font-family': '"Guardian Egyptian Web"',
                        'font-weight': '500',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianEgyptianWeb/GuardianEgyptianWeb-Medium.woff2',
                        format: 'woff'
                    },
                    // This weight contains only a certain set of chars
                    // since it is used only in one place (section names)
                    {
                        'font-family': '"Guardian Egyptian Web"',
                        'font-weight': '900',
                        file: options.webfontsDir + 'hinting-off/kerning-on/ascii/GuardianEgyptianWeb/GuardianEgyptianWeb-Semibold.woff2',
                        format: 'woff'
                    }
                ]
            }
        },
        GuardianEgyptianWebWoff: {
            options: {
                filename: options.staticTargetDir + 'fonts/GuardianEgyptianWeb.woff.json',
                callback: 'guFont',
                fonts: [
                    {
                        'font-family': '"Guardian Egyptian Web"',
                        'font-weight': '200',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianEgyptianWeb/GuardianEgyptianWeb-Light.woff',
                        format: 'woff'
                    },
                    {
                        'font-family': '"Guardian Egyptian Web"',
                        'font-weight': '400',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianEgyptianWeb/GuardianEgyptianWeb-Regular.woff',
                        format: 'woff'
                    },
                    {
                        'font-family': '"Guardian Egyptian Web"',
                        'font-weight': '500',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianEgyptianWeb/GuardianEgyptianWeb-Medium.woff',
                        format: 'woff'
                    },
                    // This weight contains only a certain set of chars
                    // since it is used only in one place (section names)
                    {
                        'font-family': '"Guardian Egyptian Web"',
                        'font-weight': '900',
                        file: options.webfontsDir + 'hinting-off/kerning-on/ascii/GuardianEgyptianWeb/GuardianEgyptianWeb-Semibold.woff',
                        format: 'woff'
                    }
                ]
            }
        },
        GuardianEgyptianWebTtf: {
            options: {
                filename: options.staticTargetDir + 'fonts/GuardianEgyptianWeb.ttf.json',
                callback: 'guFont',
                fonts: [
                    {
                        'font-family': '"Guardian Egyptian Web"',
                        'font-weight': '200',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianEgyptianWeb/GuardianEgyptianWeb-Light.ttf',
                        format: 'ttf'
                    },
                    {
                        'font-family': '"Guardian Egyptian Web"',
                        'font-weight': '400',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianEgyptianWeb/GuardianEgyptianWeb-Regular.ttf',
                        format: 'ttf'
                    },
                    {
                        'font-family': '"Guardian Egyptian Web"',
                        'font-weight': '500',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianEgyptianWeb/GuardianEgyptianWeb-Medium.ttf',
                        format: 'ttf'
                    },
                    // This weight contains only a certain set of chars
                    // since it is used only in one place (section names)
                    {
                        'font-family': '"Guardian Egyptian Web"',
                        'font-weight': '900',
                        file: options.webfontsDir + 'hinting-off/kerning-on/ascii/GuardianEgyptianWeb/GuardianEgyptianWeb-Semibold.ttf',
                        format: 'ttf'
                    }
                ]
            }
        },
        GuardianTextSansWebWoff2: {
            options: {
                filename: options.staticTargetDir + 'fonts/GuardianTextSansWeb.woff2.json',
                callback: 'guFont',
                fonts: [
                    {
                        'font-family': '"Guardian Text Sans Web"',
                        file: options.webfontsDir + 'hinting-off/kerning-on/original/GuardianTextSansWeb/GuardianTextSansWeb-Regular.woff2',
                        format: 'woff'
                    },
                    {
                        'font-family': '"Guardian Text Sans Web"',
                        'font-style': 'italic',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianTextSansWeb/GuardianTextSansWeb-RegularItalic.woff2',
                        format: 'woff'
                    },
                    {
                        'font-family': '"Guardian Text Sans Web"',
                        'font-weight': '700',
                        file: options.webfontsDir + 'hinting-off/kerning-on/original/GuardianTextSansWeb/GuardianTextSansWeb-Medium.woff2',
                        format: 'woff'
                    }
                ]
            }
        },
        GuardianTextSansWebWoff: {
            options: {
                filename: options.staticTargetDir + 'fonts/GuardianTextSansWeb.woff.json',
                callback: 'guFont',
                fonts: [
                    {
                        'font-family': '"Guardian Text Sans Web"',
                        file: options.webfontsDir + 'hinting-off/kerning-on/original/GuardianTextSansWeb/GuardianTextSansWeb-Regular.woff',
                        format: 'woff'
                    },
                    {
                        'font-family': '"Guardian Text Sans Web"',
                        'font-style': 'italic',
                        file: options.webfontsDir + 'hinting-off/kerning-on/ascii/GuardianTextSansWeb/GuardianTextSansWeb-RegularItalic.woff',
                        format: 'woff'
                    },
                    {
                        'font-family': '"Guardian Text Sans Web"',
                        'font-weight': '700',
                        file: options.webfontsDir + 'hinting-off/kerning-on/original/GuardianTextSansWeb/GuardianTextSansWeb-Medium.woff',
                        format: 'woff'
                    }
                ]
            }
        },
        GuardianTextSansWebTtf: {
            options: {
                filename: options.staticTargetDir + 'fonts/GuardianTextSansWeb.ttf.json',
                callback: 'guFont',
                fonts: [
                    {
                        'font-family': '"Guardian Text Sans Web"',
                        file: options.webfontsDir + 'hinting-off/kerning-on/original/GuardianTextSansWeb/GuardianTextSansWeb-Regular.ttf',
                        format: 'ttf'
                    },
                    {
                        'font-family': '"Guardian Text Sans Web"',
                        'font-style': 'italic',
                        file: options.webfontsDir + 'hinting-off/kerning-on/ascii/GuardianTextSansWeb/GuardianTextSansWeb-RegularItalic.ttf',
                        format: 'ttf'
                    },
                    {
                        'font-family': '"Guardian Text Sans Web"',
                        'font-weight': '700',
                        file: options.webfontsDir + 'hinting-off/kerning-on/original/GuardianTextSansWeb/GuardianTextSansWeb-Medium.ttf',
                        format: 'ttf'
                    }
                ]
            }
        },
        GuardianSansWebWoff2: {
            options: {
                filename: options.staticTargetDir + 'fonts/GuardianSansWeb.woff2.json',
                callback: 'guFont',
                fonts: [
                    {
                        'font-family': '"Guardian Sans Web"',
                        file: options.webfontsDir + 'hinting-off/kerning-on/latin1/GuardianSansWeb/GuardianSansWeb-Regular.woff2',
                        format: 'woff'
                    }
                ]
            }
        },
        GuardianSansWebWoff: {
            options: {
                filename: options.staticTargetDir + 'fonts/GuardianSansWeb.woff.json',
                callback: 'guFont',
                fonts: [
                    {
                        'font-family': '"Guardian Sans Web"',
                        file: options.webfontsDir + 'hinting-off/kerning-on/ascii/GuardianSansWeb/GuardianSansWeb-Regular.woff',
                        format: 'woff'
                    }
                ]
            }
        },
        GuardianSansWebTtf: {
            options: {
                filename: options.staticTargetDir + 'fonts/GuardianSansWeb.ttf.json',
                callback: 'guFont',
                fonts: [
                    {
                        'font-family': '"Guardian Sans Web"',
                        file: options.webfontsDir + 'hinting-off/kerning-on/ascii/GuardianSansWeb/GuardianSansWeb-Regular.ttf',
                        format: 'ttf'
                    }
                ]
            }
        }
    };
};
