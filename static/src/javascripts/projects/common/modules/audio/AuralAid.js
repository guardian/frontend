import React from 'react';
import styled from '@emotion/styled';


const VisuallyHidden = styled('span')({
    height: '1px',
    overflow: 'hidden',
    position: 'absolute',
    top: '-10px',
    width: '1px',
});


export default function({ text }) {
    return <VisuallyHidden>{text}</VisuallyHidden>;
}
