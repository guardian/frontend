// @flow

import { React, styled } from '@guardian/dotcom-rendering/packages/guui';

const Scrubber = styled('div')(({ left }) => ({
    backgroundColor: '#ffffff',
    borderRadius: '100%',
    height: '14px',
    left: `${left}px`,
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '14px',
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
