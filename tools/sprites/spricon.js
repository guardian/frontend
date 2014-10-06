/*
 * Spricon
 *
 * Sprite generator
 *
 */

var fs         = require('fs'),
    Q          = require('q'),
    phantom    = require('phantom'),
    btoa       = require('btoa');
    jf         = require('jsonfile'),
    handlebars = require('handlebars'),
    SVGO       = require('svgo'),
    svgo       = new SVGO(),
    svgCss     = [],
    pngCss     = [],
    jfDefer    = Q.defer(),
    configFile = process.argv[2];

console.info('Running Spricon with ' + configFile);

jf.readFile(configFile, function (err, json) {
    jfDefer.resolve(json);
})

jfDefer.promise.then(function (config) {

    phantom.create(function (ph) {
        ph.createPage(function (sprite) {
            sprite.set('viewportSize', { width: 600, height: 1 });
            sprite.set('content', '<html><body><div id="sprite" style="display: inline-block;"></div></body></html>');

            fs.readdir(config.src, function (err, files) {
                Q.all(
                    files.filter(function (file) {
                            return file.match(/.svg$/i);
                        })
                        .map(function (file) {
                            var deferred = Q.defer();
                            fs.readFile(config.src + file, { encoding: 'utf-8' }, function (err, data) {
                                svgo.optimize(data, function (result) {
                                    var iconName       = file.replace(/\.svg$/i, ''),
                                        iconData       = result.data,
                                        iconDataBase64 = btoa(iconData);
                                    // create svg css rule
                                    svgCss.push(
                                        handlebars.compile(
                                            '   %svg-i-{{name}},\n' +
                                            '   .svg-i-{{name}} {\n' +
                                            '       background-image: url(data:image/svg+xml;base64,{{data}});\n' +
                                            '       background-position: 0 0;\n' +
                                            '   }\n' +
                                            '   .svg .i-{{name}} {\n' +
                                            '       @extend %svg-i-{{name}} !optional;\n' +
                                            '   }'
                                        )({ name: iconName, data: iconDataBase64})
                                      );
                                    sprite.evaluate(
                                        function (iconData) {
                                            var iconContainer           = document.createElement('div');
                                            iconContainer.style.display = 'block';
                                            iconContainer.style.float   = 'left';
                                            iconContainer.style.margin  = '0 1px 1px 0'; // prevents sprite icons from leaking
                                            iconContainer.innerHTML     = iconData;
                                            document.getElementById('sprite').appendChild(iconContainer);
                                            // get position/dimension of the icon
                                            var icon = iconContainer.querySelector('svg');
                                            return {
                                                x: iconContainer.offsetLeft,
                                                y: iconContainer.offsetTop,
                                                w: Math.round(icon.getAttribute('width')),
                                                h: Math.round(icon.getAttribute('height'))
                                            };
                                        },
                                        function (iconProps) {
                                            // create png css rule
                                            pngCss.push(
                                                handlebars.compile(
                                                    '%i-{{name}},\n' +
                                                    '.i-{{name}} {\n' +
                                                    '   background-position: -{{x}}px -{{y}}px;\n' +
                                                    '   width: {{width}}px;\n' +
                                                    '   height: {{height}}px;\n' +
                                                    '}'
                                                )({
                                                    name:  iconName,
                                                    x:      iconProps.x,
                                                    y:      iconProps.y,
                                                    width:  iconProps.w,
                                                    height: iconProps.h
                                                })
                                            );
                                            deferred.resolve();
                                        },
                                        iconData
                                    );
                                });
                            });
                            return deferred.promise;
                        })
                ).then(function () {
                    var svgCssDefer = Q.defer(),
                        pngCssDefer = Q.defer(),
                        spriteDefer = Q.defer();
                    // create svg css file
                    fs.writeFile(
                        config.cssDest + config.cssSvgName, '@if ($svg-support) {\n' + svgCss.join('\n\n') + '\n}\n',
                        function () {
                            svgCssDefer.resolve();
                        }
                    );
                    // create png css file
                    fs.writeFile(
                        config.cssDest + config.cssPngName, pngCss.join('\n\n') + '\n',
                        function () {
                            pngCssDefer.resolve();
                        }
                    );
                    // shrink sprite
                    sprite.evaluate(
                        function () {
                            var container = document.getElementById('sprite');
                            return {
                                width: container.offsetWidth,
                                height: container.offsetHeight
                            };
                        },
                        function (size) {
                            sprite.set('viewportSize', size);
                            sprite.render(config.imgDest + 'sprite.png', function () {
                                spriteDefer.resolve();
                            });
                        }
                    );
                    Q.all([svgCssDefer.promise, pngCssDefer.promise, spriteDefer.promise]).then(function () {
                        ph.exit();
                    })

                });
            });

        });
    }, { binary: '../../node_modules/phantomjs/bin/phantomjs' });

});
