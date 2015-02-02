define([
    'text'
], function(
    text
) {

    var buildText = {};

    return {

        load: function(name, req, onLoad, config) {
            var prefix = 'inline-';
            var data = name.split('!'),

                path = data[0],
                imageType = data[1] || '',

                dirs = path.split('/'),
                fileName = dirs.pop();

            text.get(req.toUrl(dirs.join('/') + '/' + imageType + '/' + fileName + '.svg'), function(svg) {

                svg = '<span class="' + prefix + fileName + ' ' + (imageType !== '' ? prefix + imageType : '') + '">' + svg + '</span>';

                if (config.isBuild) {
                    buildText[name] = text.jsEscape(svg);
                }

                onLoad(svg);

            }, onLoad.error);
        },


        write: function (pluginName, moduleName, write) {
            if (buildText.hasOwnProperty(moduleName)) {
                var name = "'" + pluginName + "!" + moduleName  + "'",
                    text = "function () {return '" + buildText[moduleName] + "';}";

                write("define(" + name + ", " + text + ");\n");
            }
        }

    };

});
