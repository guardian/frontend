// @flow
import style from './style.scss';

export default (props: Object) =>
    <button
        style={style.button}
        onClick={() => console.log('clicked the button!!')}
    >
        {props.children}
    </button>;
