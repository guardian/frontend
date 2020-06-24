// @flow
import React, { Component } from 'react';
import styled from '@emotion/styled';

import AuralAid from './AuralAid';
import Slider from './Slider';

// $FlowFixMe
const Progress = styled('div')(
    ({ backgroundColor, height, highlightColor, barContext }) => ({
        alignItems: 'stretch',
        backgroundColor,
        backgroundClip: 'content-box',
        display: 'flex',
        height: `${height + 4 * 2}px`,
        padding: barContext === 'volume' ? '4px' : '4px 0px',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        position: 'relative',
        '&:hover': {
            '.track-foreground': {
                backgroundColor: highlightColor,
            },
        },
    })
);

const Track = styled('div')(({ backgroundColor, width }) => ({
    width,
    backgroundColor,
}));

const pct = n => `${n}%`;

type Props = {
    value: number,
    onChange: number => void,
    formattedValue: string,
    barHeight: number,
    trackColor: string,
    backgroundColor: string,
    barContext: string,
    highlightColor: string,
};

type State = {
    dragging: boolean,
    draggingValue?: number,
    value: number,
    position: number,
    width: number,
    left: number,
};

export default class ProgressBar extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onChange = props.onChange;
        this.state = {
            dragging: false,
            value: props.value,
            position: 0,
            width: 0,
            left: 0,
        };
    }

    componentDidMount() {
        const { width, left } = this.element.getBoundingClientRect();
        const position = (this.state.value * width) / 100;
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({ width, left, position });
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.value !== prevProps.value) {
            const position = (this.props.value * this.state.width) / 100;
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ position });
        }
    }

    onChange: number => void;

    getElement = (el: ?HTMLElement) => {
        if (el) {
            this.element = el;
        }
    };

    element: HTMLElement;

    start = (e: MouseEvent) => {
        const position = e.clientX - this.state.left;
        const value = (position * 100) / this.state.width;
        this.setState({ dragging: true, position, value });
        window.addEventListener('mousemove', this.update);
        window.addEventListener('mouseup', this.stop, { once: true });
    };

    stop = () => {
        this.setState({ dragging: false });
        this.onChange(this.state.value);
        window.removeEventListener('mousemove', this.update);
    };

    update = (e: MouseEvent) => {
        const rawPosition = e.clientX - this.state.left;
        const position = this.cleanUpPosition(rawPosition);
        const value = (position * 100) / this.state.width;
        this.setState({ value, position });
    };

    cleanUpPosition = (num: number) => {
        const position = Math.min(this.state.width, num);
        return Math.max(0, position);
    };

    render() {
        return (
            <Progress
                ref={this.getElement}
                backgroundColor={this.props.backgroundColor}
                highlightColor={this.props.highlightColor}
                barContext={this.props.barContext}
                height={this.props.barHeight}
                onMouseDown={this.start}
                role="progressbar"
                aria-valuenow={
                    this.state.dragging
                        ? this.state.draggingValue
                        : this.props.value
                }
                aria-valuemin="0"
                aria-valuemax="100">
                <Track
                    className="track-foreground"
                    backgroundColor={this.props.trackColor}
                    width={pct(this.props.value)}
                />
                <AuralAid text={this.props.formattedValue} />
                <Slider
                    min={0}
                    max={this.state.width}
                    value={this.state.position}
                />
            </Progress>
        );
    }
}
