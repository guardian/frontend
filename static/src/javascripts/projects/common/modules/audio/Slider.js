import React from 'react';
import styled from '@emotion/styled';


const Scrubber = styled('div')(({ left }) => ({
    backgroundColor: '#ffe500',
    height: '50px',
    left: `${left}px`,
    position: 'relative',
    top: '0',
    transform: 'translate(-50%, -76%)',
    width: '5px',
}));


export default function Slider({ min, max, value }) {
    return (
        <Scrubber
            left={value}
            role="slider"
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
        />
    );
}
