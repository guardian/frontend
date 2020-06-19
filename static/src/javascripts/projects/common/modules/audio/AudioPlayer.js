// @flow
/* eslint-disable no-nested-ternary */
import {
    React,
    Component,
    styled,
} from '@guardian/dotcom-rendering/packages/guui';
import palette from '@guardian/dotcom-rendering/packages/pasteup/palette';
import {
    leftCol,
    wide,
} from '@guardian/dotcom-rendering/packages/pasteup/breakpoints';
import { isIOS, isAndroid } from 'lib/detect';

import pauseBtn from 'svgs/journalism/audio-player/pause.svg';
import playBtn from 'svgs/journalism/audio-player/play.svg';
import volumeOn from 'svgs/journalism/audio-player/sound-on.svg'; // eslint-disable-line
import volumeOff from 'svgs/journalism/audio-player/sound-off.svg'; // eslint-disable-line
import fastBackward from 'svgs/journalism/audio-player/backward.svg';
import fastForward from 'svgs/journalism/audio-player/forward.svg';

import waveW from 'svgs/journalism/audio-player/wave-wide.svg';
import { registerOphanListeners } from './utils';

import Time from './Time';

const AudioGrid = styled('div')({
    display: 'grid',
    backgroundColor: palette.neutral[1],
    color: palette.neutral[5],
    gridTemplateRows:
        isIOS() || isAndroid() ? '30px 40px 120px' : '30px 40px 120px 40px',
    gridTemplateAreas: `"currentTime duration"
         "wave wave"
         "controls controls"
         ". volume"
        `,

    [leftCol]: {
        position: 'relative',
        gridTemplateColumns: '90px 1fr 90px',
        gridTemplateRows: '50px 110px',
        gridTemplateAreas: `"currentTime wave duration"
        "controls controls controls"`,
    },
});

const Button = styled('button')({
    background: 'none',
    border: 0,
    cursor: 'pointer',
    margin: 0,
    ':focus': {
        outline: 'none', // ಠ_ಠ
    },
    padding: 0,

    ':not(:disabled):hover svg': {
        opacity: 0.8,
    },
});

const PlayButton = styled(Button)({
    margin: '0 50px',

    svg: {
        width: '70px',
        height: '70px',
    },

    [leftCol]: {
        margin: '0 60px',
        svg: {
            width: '60px',
            height: '60px',
        },
    },
});

const JumpButton = styled(Button)(({ playing }) => ({
    svg: {
        width: '31px',
        height: '30px',
    },

    path: {
        fill: playing ? '#ffffff' : '#767676',
    },

    '.arrow-line': {
        fill: 'none',
        stroke: playing ? '#ffffff' : '#767676',
    },

    [leftCol]: {
        padding: 0,
        svg: {
            width: '31px',
            height: '30px',
        },
    },

    [wide]: {
        padding: 0,
        svg: {
            width: '31px',
            height: '30px',
        },
    },
}));

const VolumeButton = styled(Button)(({ isActive }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',

    svg: {
        fill: isActive ? '#ffe500' : '#767676',
        width: '23px',
        height: '18px',
    },
}));

const TimeContainer = styled('div')(({ area }) => ({
    [area === 'currentTime' ? 'paddingLeft' : 'paddingRight']: '10px',
    gridArea: area,
    paddingTop: '4px',
    fontFamily: 'Guardian Text Sans Web',
    display: 'flex',
    alignItems: 'center',
    justifyContent: area === 'duration' ? 'flex-end' : 'flex-start',
    backgroundColor: '#333333',
}));

const Controls = styled('div')({
    gridArea: 'controls',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
});

const WaveAndTrack = styled('div')({
    gridArea: 'wave',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    cursor: 'pointer',
    maxWidth: '100%',
    backgroundColor: '#333333',
    borderTop: '1px solid #767676',
    position: 'relative',

    [leftCol]: {
        background: '#4a4a4a',
        borderTop: '0',
    },
});

const FakeWave = styled('div')({
    height: '100%',
    paddingLeft: '10px',
    paddingRight: '10px',

    '.wave-holder': {
        height: '100%',
    },

    '.inline-wave-wide': {
        display: 'block',
        height: '100%',
    },

    svg: {
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
    },

    '#WaveRectangleBg': {
        fill: 'rgba(255,255,255,.2)',
    },

    '#WaveRectangleBuffered': {
        fill: 'rgba(255,255,255, .5)',
        width: '100px',
    },

    '#WaveRectangleActive': {
        fill: 'rgba(255,255,255, 1)',
        width: '100px',
    },

    [leftCol]: {
        paddingLeft: '0',
        paddingRight: '0',
    },
});

const ScrubberButton = styled(Button)(({ position, hovering, grabbing }) => ({
    position: 'absolute',
    background: '#ffe500',
    width: '4px',
    height: '40px',
    transform: `translate(${10 + position}px,0)`,
    cursor: grabbing ? 'grabbing' : hovering ? 'grab' : 'pointer',

    ':hover': {
        transform: `translate(${10 + position}px,0) scaleX(1.6)`,
    },

    [leftCol]: {
        height: '50px',
        transform: `translate(${position}px,0)`,

        ':hover': {
            transform: `translate(${position}px,0) scaleX(1.6)`,
        },
    },
}));

const Volume = styled('div')({
    gridArea: 'volume',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    svg: {
        width: '23px',
        height: '18px',
    },
    span: {
        display: 'inline-flex',
        alignItems: 'center',
        paddingLeft: '5px',
        paddingRight: '5px',
    },

    'span + span': {
        borderLeft: '1px solid #767676',
    },

    [leftCol]: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        height: '40px',
    },

    'button + button': {
        borderLeft: '1px solid #767676',
    },
});

type Props = {
    sourceUrl: string,
    mediaId: string,
    duration: string,
};

type State = {
    playing: boolean,
    muted: boolean,
    currentTime: number,
    duration: number,
    currentOffsetPx: number,
    hasBeenPlayed: boolean,
    waveX: number,
    waveWidthPx: number,
    hovering: boolean,
    grabbing: boolean,
};

export class AudioPlayer extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            playing: false,
            muted: false,
            currentTime: 0,
            currentOffsetPx: 0,
            duration: parseInt(this.props.duration, 10),
            hasBeenPlayed: false,
            waveX: 0,
            waveWidthPx: 0,
            hovering: false,
            grabbing: false,
        };
    }

    componentDidMount() {
        this.audio.addEventListener('timeupdate', this.onTimeUpdate);
        // this should fire on Firefox
        this.audio.addEventListener('ended', this.resetAudio);
        this.audio.addEventListener('progress', this.buffer);

        registerOphanListeners(this.audio);

        if (Number.isNaN(this.audio.duration)) {
            this.audio.addEventListener('durationchange', this.ready, {
                once: true,
            });
        } else {
            this.ready();
        }
    }

    onTimeUpdate = () => {
        const percentPlayed = this.audio.currentTime / this.state.duration;

        // pause when it gets to the end
        if (this.audio.currentTime > this.state.duration - 1) {
            this.resetAudio();
        } else if (!this.state.grabbing) {
            const currentOffsetPx = this.state.waveWidthPx * percentPlayed;
            this.wave.setAttribute('width', currentOffsetPx.toString());
            this.setState({
                currentTime: this.audio.currentTime,
                currentOffsetPx,
            });
        }
    };

    setAudio = (el: ?HTMLAudioElement) => {
        if (el) {
            this.audio = el;
        }
        const wave = document.getElementById('WaveCutOff-rect');
        const waveBuffered = document.getElementById('WaveCutOffBuffered-rect');
        if (wave && waveBuffered) {
            this.wave = wave;
            this.waveBuffered = waveBuffered;
        }
    };

    setGeometry = (el: ?HTMLElement) => {
        if (el) {
            const css = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            const waveWidthPx =
                el.clientWidth -
                parseInt(css.paddingLeft, 10) -
                parseInt(css.paddingRight, 10);
            Array.from(el.getElementsByTagName('svg'))
                .slice(0, 1)
                .forEach(svg => {
                    svg.setAttribute('viewBox', `0 0 ${waveWidthPx} 84`);
                });
            this.setState({
                waveX: rect.left,
                waveWidthPx,
            });
        }
    };

    buffer = () => {
        if (this.audio.buffered.length > 0) {
            const buffered = this.audio.buffered.end(0);
            this.waveBuffered.setAttribute(
                'width',
                (
                    (buffered / this.state.duration) *
                    this.state.waveWidthPx
                ).toString()
            );
        }
    };

    resetAudio = () => {
        this.setState({ playing: false });
        this.audio.pause();
    };

    audio: HTMLAudioElement;
    wave: Element;
    waveBuffered: Element;

    ready = () => {
        this.setState({ duration: this.audio.duration });
    };

    play = () => {
        this.setState(
            {
                playing: !this.state.playing,
            },
            () => {
                if (this.state.playing) {
                    this.audio.play();
                } else {
                    this.audio.pause();
                }
            }
        );
        if (!this.state.hasBeenPlayed) {
            this.setState({ hasBeenPlayed: true });
        }
    };

    seek = (e: any) => {
        if (!this.state.grabbing) {
            const currentOffsetPx = e.nativeEvent.offsetX;
            const currentTime =
                (currentOffsetPx / this.state.waveWidthPx) *
                this.state.duration;
            this.audio.currentTime = currentTime;
            this.wave.setAttribute('width', currentOffsetPx.toString());
            this.setState({ currentTime, currentOffsetPx });
        }
    };

    updatePlayerTime = (currTime: number) => {
        this.audio.currentTime = currTime;

        const currentOffsetPx =
            (currTime / this.state.duration) * this.state.waveWidthPx;
        this.wave.setAttribute('width', currentOffsetPx.toString());
        this.setState({
            currentTime: currTime,
            currentOffsetPx,
        });
    };

    forward = () => {
        const chosenTime = Math.min(
            this.state.currentTime + 15,
            this.state.duration
        );
        this.updatePlayerTime(chosenTime);
    };

    backward = () => {
        const chosenTime = Math.max(this.state.currentTime - 15, 0);
        this.updatePlayerTime(chosenTime);
    };

    mute = () => {
        this.setState({ muted: true });
        this.audio.volume = 0;
    };

    sound = () => {
        this.setState({ muted: false });
        this.audio.volume = 1;
    };

    hovering = (hovering: boolean) => () => {
        this.setState({ hovering });
    };

    grabbing = (grabbing: boolean) => () => {
        if (this.state.hovering || !grabbing) {
            this.setState({ grabbing }, () => {
                if (!this.state.grabbing) {
                    this.audio.currentTime = this.state.currentTime;
                }
            });
        }
    };

    scrub = (e: any) => {
        if (this.state.grabbing) {
            const currentOffsetPx = Math.min(
                this.state.waveWidthPx,
                Math.max(0, e.nativeEvent.screenX - this.state.waveX)
            );

            const currentTime =
                (currentOffsetPx / this.state.waveWidthPx) *
                this.state.duration;

            this.setState({ currentTime, currentOffsetPx }, () => {
                this.wave.setAttribute('width', currentOffsetPx.toString());
            });
        }
    };

    render() {
        return (
            <AudioGrid
                onMouseDown={this.grabbing(true)}
                onMouseUp={this.grabbing(false)}
                onMouseMove={this.scrub}>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio
                    ref={this.setAudio}
                    data-media-id={this.props.mediaId}
                    preload="none">
                    <source src={this.props.sourceUrl} type="audio/mpeg" />
                </audio>
                <TimeContainer area="currentTime">
                    <Time t={this.state.currentTime} />
                </TimeContainer>
                <TimeContainer area="duration">
                    <Time t={this.state.duration} />
                </TimeContainer>
                <WaveAndTrack>
                    <FakeWave innerRef={this.setGeometry} onClick={this.seek}>
                        <div
                            className="wave-holder"
                            dangerouslySetInnerHTML={{ __html: waveW.markup }}
                        />
                    </FakeWave>
                    <ScrubberButton
                        onMouseEnter={this.hovering(true)}
                        onMouseLeave={this.hovering(false)}
                        hovering={this.state.hovering}
                        grabbing={this.state.grabbing}
                        position={this.state.currentOffsetPx}
                    />
                </WaveAndTrack>
                <Controls>
                    <JumpButton
                        playing={this.state.playing}
                        onClick={this.backward}
                        disabled={!this.state.playing}
                        dangerouslySetInnerHTML={{
                            __html: fastBackward.markup,
                        }}
                    />
                    <PlayButton
                        onClick={this.play}
                        dangerouslySetInnerHTML={{
                            __html: this.state.playing
                                ? pauseBtn.markup
                                : playBtn.markup,
                        }}
                    />
                    <JumpButton
                        playing={this.state.playing}
                        onClick={this.forward}
                        disabled={!this.state.playing}>
                        <span
                            dangerouslySetInnerHTML={{
                                __html: fastForward.markup,
                            }}
                        />
                    </JumpButton>
                </Controls>
                {!(isIOS() || isAndroid()) ? (
                    <Volume>
                        <VolumeButton
                            isVolume
                            isActive={!this.state.muted}
                            onClick={this.sound}
                            dangerouslySetInnerHTML={{
                                __html: volumeOn.markup,
                            }}
                        />
                        <VolumeButton
                            isVolume
                            isActive={this.state.muted}
                            onClick={this.mute}
                            dangerouslySetInnerHTML={{
                                __html: volumeOff.markup,
                            }}
                        />
                    </Volume>
                ) : null}
            </AudioGrid>
        );
    }
}
