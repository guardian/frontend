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

                function setStyle(node, style) {
                    node.attributes.style = Object.assign({}, node.attributes.style, style);
                }

                function setBlockStyles(node) {
                    const style = props['block-styles'][node.attributes['data-block']];
                    if (style) setStyle(node, style);
                    node.children.forEach(setBlockStyles);
                }

                if (props.className) {
                    if (svg.attributes['class']) {
                        svg.attributes['class'] += props.className;
                    } else {
                        svg.attributes['class'] = props.className;
                    }
                }
                if (props['block-styles']) setBlockStyles(svg);

                return svg;
            }
        `
        );
    });
};
