// @flow
import Article from 'views/article';
import { body, side } from './style.scss';

export default (props: Object) =>
    <body style={body}>
        <div style={side}>
            <Article {...props} />
        </div>
    </body>;
