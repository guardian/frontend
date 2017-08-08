// @flow

// includes:
// - https://meyerweb.com/eric/tools/css/reset
// - https://css-tricks.com/inheriting-box-sizing-probably-slightly-better-best-practice

import resetCSS from './reset.css';

export default (props: any, css: string) =>
    `<head lang="en" data-page-path="/uk">
        <meta charset="utf-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Page not found | The Guardian</title>
        <meta name="description" content="">
        <meta name="format-detection" content="telephone=no"/>
        <meta name="HandheldFriendly" content="True"/>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>${resetCSS}</style>
        ${css}
    </head>`;
