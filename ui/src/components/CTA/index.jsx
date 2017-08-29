// @flow
import styles from './style.js.scss';

export default (props: Object) => {
    // const Icon = import(props.icon)

    return <a href={props.href} style={Object.assign(styles.CTA, styles[props.color])}>
        {props.children}
    </a>
}
