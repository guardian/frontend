// @flow
import style from './style.scss';

export default (props: { children: Array<any> }) =>
    <button style={style.button}>
        {props.children}
    </button>;
