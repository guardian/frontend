// @flow
export default (props: any, css: string) =>
    `<head>
        <title>${props.page.headline} | ${props.page
        .section} | The Guardian</title>
        <style>
        *, * > * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        </style>
        ${css}
        <script>window.guardian = ${JSON.stringify(props)};</script>
        <script src="/assets/javascripts/ui.bundle.browser.js" async defer></script>
    </head>`;
