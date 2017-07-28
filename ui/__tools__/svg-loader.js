const HTMLtoJSX = require('htmltojsx');
const SVGO = require('svgo');

const converter = new HTMLtoJSX({
    createClass: false,
});

const svgo = new SVGO({
    plugins: [
        {
            removeXMLNS: true,
        },
    ],
});

module.exports = function loadSVG(source) {
    const callback = this.async();

    svgo.optimize(source, result => {
        callback(
            null,
            `export default props => {
                const svg = ${converter.convert(result.data)};

                function setStyles(node) {
                    const style = props['block-styles'][node.attributes['data-block']];
                    if (style) node.attributes.style = Object.assign({}, node.attributes.style, style);
                    node.children.forEach(setStyles);
                }

                if (props['block-styles']) setStyles(svg);

                return svg;
            }
        `
        );
    });
};
