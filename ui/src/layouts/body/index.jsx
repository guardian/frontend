// @flow
import Application from 'applications/404';
import { body, side } from './style.scss';

export default (props: Object) =>
    <body style={body}>
        <div style={side}>
            <Application {...props} />
        </div>
    </body>;
