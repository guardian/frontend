// @flow

// includes:
// - https://meyerweb.com/eric/tools/css/reset
// - https://css-tricks.com/inheriting-box-sizing-probably-slightly-better-best-practice

import loadApp from './__inline__/loadApp';
import resetCSS from './reset.css';
import fontsCSS from './fonts.css';

//  Having to typecast loadApp to a string here to appease flow
const loadAppStr: string = (loadApp: any);

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
        ${appCSS}
        <script>
            window.guardian = ${JSON.stringify(props)};

            ${loadAppStr}
        </script>
    </head>`;
