// @flow
import { cta, icon } from './style.css';

export default (props: Object) => (
    <a href={props.href} style={cta}>
        {props.children}
        <props.icon style={icon} />
    </a>
);
