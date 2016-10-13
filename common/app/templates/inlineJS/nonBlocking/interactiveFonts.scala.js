var fonts = [].slice.apply(window.parent.document.styleSheets)
    .filter(function (sheet) { return sheet.ownerNode.className.indexOf("webfont") > - 1; })
    .map(function (sheet) { return sheet.ownerNode.textContent; })
    .join(' ');
var css = document.createElement('style');
css.textContent = fonts;
document.head.appendChild(css);
