// @flow
import {CTA, icon,} from './style.js.scss';

export default (props: Object) => {
    // const Icon = import(props.icon)

    return <a href={props.href} style={CTA}>
        {props.children}
        <props.icon
            svg-styles={icon}
        />
    </a>
}
