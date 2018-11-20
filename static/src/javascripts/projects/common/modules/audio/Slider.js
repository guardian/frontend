// @flow

import { React, styled } from '@guardian/dotcom-rendering/packages/guui';

const Scrubber = styled('div')(({ left }) => ({
    backgroundColor: '#ffe500',
    height: '50px',
    left: `${left}px`,
    position: 'relative',
    top: '0',
    transform: 'translate(-50%, -76%)',
    width: '5px',
}));

type Props = {
    min: number,
    max: number,
    value: number,
};

export default function Slider({ min, max, value }: Props) {
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
