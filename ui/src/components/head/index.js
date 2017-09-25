// @flow

// includes:
// - https://meyerweb.com/eric/tools/css/reset
// - https://css-tricks.com/inheriting-box-sizing-probably-slightly-better-best-practice

import loadApp from './__inline__/loadApp';
import loadFonts from './__inline__/loadFonts';
import resetCSS from './__inline__/reset.css';
import fontsCSS from './__inline__/fonts.css';

//  Having to typecast loadApp to a string here to appease flow
const loadAppStr: string = (loadApp: any);
const loadFontsStr: string = (loadFonts: any);

const getFontDefinitions = (fontDefinitions: Array<Object>): string => {
    let html = '';

    fontDefinitions.forEach(typeFace => {
        html += `<style class="webfont" data-cache-name="${typeFace.typeFace}"`;

        typeFace.fileTypes.forEach(fileType => {            
            html += ` data-cache-file-${fileType.fileType}="${fileType.endpoint}"`;

            fileType.hintTypes.forEach(hintType => {
                html += ` data-cache-file-hinted-${hintType.hintType}-${fileType.fileType}="${hintType.endpoint}"`;
            });
        });

        html += '></style>';
    });

    return html;
};

export default (props: any, appCSS: string) =>
    `<head lang="en" data-page-path="/uk">
        <meta charset="utf-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Page not found | The Guardian</title>
        <meta name="description" content="">
        <meta name="format-detection" content="telephone=no"/>
        <meta name="HandheldFriendly" content="True"/>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>${resetCSS}</style>
        <style>${fontsCSS}</style>
        ${getFontDefinitions(props.fontDefinitions)}
        ${appCSS}
        <script>
            window.guardian = ${JSON.stringify(props)};
            ${loadAppStr}
            ${loadFontsStr}
        </script>
    </head>`;
