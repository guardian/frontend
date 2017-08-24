/* @flow */

// temporarily commit preact libdef,
// pending https://github.com/developit/preact/pull/782

import react from 'react';
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
