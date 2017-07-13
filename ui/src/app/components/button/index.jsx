// @flow
import style from './style.scss';

const onClick = BROWSER ? () => console.log('clicked the button!!') : null;

export default (props: Object) =>
    <button style={style.button} onClick={onClick}>
        {props.children}
    </button>;
