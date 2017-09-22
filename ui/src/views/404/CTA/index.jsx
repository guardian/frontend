// @flow
import {CTA, icon,} from './style.css';

export default (props: Object) => {
    // const Icon = import(props.icon)

    return <a href={props.href} style={CTA}>
        {props.children}
        <props.icon
            style={icon}
        />
    </a>
}
