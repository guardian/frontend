/*
 * Spricon
 *
 * Sprite generator
 *
 */

var fs      = require('fs'),
    Q       = require('q'),
    phantom = require('phantom'),
    btoa    = require('btoa');
    jf      = require('jsonfile'),
    SVGO    = require('svgo'),
    svgo    = new SVGO(),
    target  = './',
    svgCss  = [],
    pngCss  = [],
    jfDefer = Q.defer();

jf.readFile(process.argv[2], function (err, json) {
    jfDefer.resolve(json);
})

jfDefer.promise.then(function (config) {

    console.log(config)

    phantom.create(function (ph) {
        ph.createPage(function (sprite) {
            sprite.set('viewportSize', { width: 600, height: 1 });
            sprite.set('content', '<html><body><div id="sprite" style="overflow:auto;"></div></body></html>');

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
                                        '\t%svg-i-' + iconName + ',\n' +
                                        '\t.svg-i-' + iconName + ' {\n' +
                                        '\t\tbackground-image: url(data:image/svg+xml;base64,' + iconDataBase64 + ');\n' +
                                        '\t\tbackground-position: 0 0;\n' +
                                        '\t}\n' +
                                        '\t.svg .i-' + iconName + '{\n' +
                                        '\t\t@extend %svg-i-' + iconName + ' !optional;\n' +
                                        '\t}'
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
                                                '%i-' + iconName + ',\n' +
                                                '.i-' + iconName + ' {\n' +
                                                '\tbackground-position: -' + iconProps.x + 'px -' + iconProps.y + 'px;\n' +
                                                '\twidth: ' + iconProps.w + 'px;\n' +
                                                '\theight: ' + iconProps.h + 'px;\n' +
                                                '}'
                                            );
                                            deferred.resolve();
                                        },
                                        iconData
                                    );
                                });
                            })
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
    });

});
