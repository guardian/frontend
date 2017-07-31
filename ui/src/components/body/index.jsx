// @flow

import { body, side } from './style.js.scss';

export default (props: Object) =>
    <body style={body}>
        <div style={side}>
            {props.children}
        </div>
    </body>;
