// @flow

// this guy has inline styles written in JS

import { font, colour } from 'pasteup';

const small = false;

const style = {
    color: colour.brandBlueDark,
    fontSize: small ? font.size.small : '100px',
    '@supports (display: flexbox)': {
        float: 'right',
    },
};

export default (props: Object) =>
    <sub style={style}>
        {props.children}
    </sub>;
