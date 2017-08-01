// @flow

import { body } from './style.js.scss';

export default (props: Object) =>
    <body style={body}>
        {props.children}
    </body>;
