/*
 * Spricon
 *
 * Sprite generator
 *
 */

const fs = require('fs');
const path = require('path');
const glob = require("glob");
const phantom = require('phantom');
const btoa = require('btoa');
const SVGO = require('svgo');
const mkdirp = require('mkdirp');
const svgo = new SVGO();

const configs = glob.sync('./*.json');

/**
 * this is the meat of what happens:
 */

phantom.create().then(ph => {
    const sprites = configs.map(configPath => {
        console.info(`Running Spricon with ${configPath}`);

        const config = require(configPath);
        const imagePaths = glob.sync(`${config.src}/*.svg`);

        return makeDest(config)
            .then(getImages.bind(null, imagePaths))
            .then(sortImages)
            .then(files => generateSVGSass(config, files))
            .then(files => generatePNGSass(config, files, ph))
            .then(page => generatePNGSprite(config, page))
            .catch(e => console.log(e));
    });
    Promise.all(sprites).then(() => {
        ph.exit();
    });
})

/**
 * these are the individual functions used above...
 */

const makeDest = config => new Promise((resolve, reject) => {
    fs.exists(config.cssDest, (exists) => {
        if (exists) {
            resolve();
        } else {
            mkdirp(config.cssDest, err => err ? reject(err) : resolve());
        }
    });
});

const getImages = paths => Promise.all(
    paths.map(file =>
        new Promise((resolve, reject) => {
            fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
                if (err) { reject(err) };
                svgo.optimize(data, result => {
                    resolve({
                        name: path.parse(file).name,
                        data: result
                    });
                });
            });
        })
    )
);

// order by height, then width, then name
const sortImages = images => images.sort((a, b) => {
    const aInfo = a.data.info;
    const bInfo = b.data.info;
    if (aInfo.height !== bInfo.height) {
        return aInfo.height - bInfo.height;
    } else if (aInfo.width !== bInfo.width) {
        return bInfo.width  - aInfo.width;
    } else {
        return a.name.localeCompare(b.name);
    }
});

const generateSVGSass = (config, files) => {
    const SVGSass = files.map(file => {
        const {name, data: fileData} = file;
        return `
                %svg-i-${name},
                .svg-i-${name} {
                    background-image: url(data:image/svg+xml;base64,${btoa(fileData.data)});
                    background-position: 0 0;
                }
                .svg .i-${name} {
                    @extend %svg-i-${name} !optional;
                }
        `.replace(/                /g, '');
    });
    // create svg scss file
    return new Promise((resolve, reject) => {
        fs.writeFile(
            config.cssDest + config.cssSvgName, `
                @if ($svg-support) {
                    ${SVGSass.join('').trim()}
                }
            `.trim().replace(/                /g, ''),
            err => err ? reject(err) : resolve(files)
        );
    });
}

const generatePNGSass = (config, files, ph) => {
    return ph.createPage()
        .then(page => {
            page.property('viewportSize', { width: 600, height: 1 });
            page.property('content', '<html><body id="sprite" style="margin: 0" /></html>');
            return page;
        })
        .then(page => {
            return Promise.all(files.map(file => {
                const {name, data: fileData} = file;
                return page.evaluate(function (data) {
                    var iconContainer = document.createElement('div'), icon;
                    iconContainer.style.display = 'block';
                    iconContainer.style.float = 'left';
                    iconContainer.style.margin = '0 1px 1px 0'; // prevents sprite icons from leaking
                    iconContainer.innerHTML = data;
                    document.getElementById('sprite').appendChild(iconContainer);
                    icon = iconContainer.querySelector('svg');
                    return {
                        x: iconContainer.offsetLeft,
                        y: iconContainer.offsetTop,
                        width: Math.round(icon.getAttribute('width')),
                        height: Math.round(icon.getAttribute('height'))
                    };
                }, fileData.data)
                    .then(props => {
                        // create png css rule
                        const {x, y, width, height} = props;
                        return `
                            %i-${name},
                            .i-${name} {
                                background-position: -${x}px -${y}px;
                                width: ${width}px;
                                height: ${height}px;
                            }
                        `.replace(/                            /g, '');
                    });
            }))
            // create PNG scss file
            .then(scss => {
                return new Promise((resolve, reject) => {
                    fs.writeFile(
                        config.cssDest + config.cssPngName, scss.join('').trim(),
                        err => err ? reject(err) : resolve(page)
                    );
                });
            });
        })
}

const generatePNGSprite = (config, page) => {
    return page.evaluate(
        function () {
            var container = document.getElementById('sprite');
            return {
                width: container.offsetWidth,
                height: container.offsetHeight
            };
        }
    ).then(size => {
        page.property('viewportSize', size);
        // create PNG sprite file
        return page.render(`${config.imgDest}sprite.png`);
    });
};

