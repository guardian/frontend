/* @flow */

// temporarily commit preact libdef,
// pending https://github.com/developit/preact/pull/782

import * as react from 'react';
import { render } from 'react-dom';

declare module "preact" {
    declare export var h: typeof react.createElement;
    declare export var createElement: typeof react.createElement;
    declare export var cloneElement: typeof react.cloneElement;
    declare export var Component: typeof react.Component;
    declare export var render: typeof render;

    declare export default {
        h: typeof react.createElement,
        cloneElement: typeof react.cloneElement,
        Component: typeof react.Component,
        render: typeof render
    };

    declare export function rerender(): void;
    declare export var options: Object;

}

// Because we inject the h pragma, flow assumes our jsx is React.
// But because it's not and we're therefore not importing it,
// it freaks out saying it's undeclared. This just makes it a global.
declare var React: $Exports<'react'>;
