// @flow
/* eslint-disable no-nested-ternary */
import {
    React,
    Component,
    styled,
} from '@guardian/dotcom-rendering/packages/guui';
import palette, {
    pillarsHighlight,
} from '@guardian/dotcom-rendering/packages/pasteup/palette';
import {
    leftCol,
    wide,
} from '@guardian/dotcom-rendering/packages/pasteup/breakpoints';

import pauseBtn from 'svgs/journalism/audio-player/pause-btn.svg';
import playBtn from 'svgs/journalism/audio-player/play-btn.svg';
import volumeOn from 'svgs/journalism/audio-player/volume-on.svg'; // eslint-disable-line
import volumeOff from 'svgs/journalism/audio-player/volume-on.svg'; // eslint-disable-line
import fastBackward from 'svgs/journalism/audio-player/fast-backward.svg';
import fastForward from 'svgs/journalism/audio-player/fast-forward.svg';
import fastBackwardActive from 'svgs/journalism/audio-player/fast-backward-active.svg';
import fastForwardActive from 'svgs/journalism/audio-player/fast-forward-active.svg';

import waveW from 'svgs/journalism/audio-player/wave-wide.svg';
import { sendToOphan, checkForTimeEvents } from './utils';

import Time from './Time';

const AudioGrid = styled('div')({
    display: 'grid',
    backgroundColor: palette.neutral[1],
    color: palette.neutral[5],
    gridTemplateRows: '30px 40px 120px 45px',
    gridTemplateAreas: `"currentTime duration"
         "wave wave"
         "controls controls"
         "download volume"
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
});

const PlayButton = styled(Button)({
    padding: '0 50px',
    svg: {
        width: '70px',
        height: '70px',
    },

    [leftCol]: {
        padding: '0 60px',
        svg: {
            width: '60px',
            height: '60px',
        },
    },
});

const JumpButton = styled(Button)({
    svg: {
        width: '31px',
        height: '30px',
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
});

const VolumeButton = styled(Button)(({ isActive }) => ({
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
    },

    path: {
        fill: '#767676',
    },

    [leftCol]: {
        paddingLeft: '0',
        paddingRight: '0',
    },
});

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
        height: '45px',
    },
});

const Download = styled('div')({
    gridArea: 'download',
    fontFamily: 'Guardian Text Sans Web',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: '10px',
    a: {
        color: '#cbcbcb', // TODO: add to the palette
        backgroundColor: '#333333',
        borderRadius: '17px',
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 14px',
        fontSize: '14px',
        fontWeight: 'bold',
        textDecoration: 'none',

        ':hover': {
            borderColor: '#ffffff',
        },
    },

    [leftCol]: {
        position: 'absolute',
        bottom: '0',
        left: '0',
        marginBottom: '9px',
    },
});

type Props = {
    sourceUrl: string,
    mediaId: string,
    downloadUrl: string,
    pillar: string,
};

type State = {
    ready: boolean,
    playing: boolean,
    muted: boolean,
    currentTime: number,
    duration: number,
    bins: ?NodeList<HTMLElement>,
    interval: number,
    currentOffset: number,
    hasBeenPlayed: boolean,
};

export class AudioPlayer extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            ready: false,
            playing: false,
            muted: false,
            currentTime: 0,
            duration: 3000,
            bins: null,
            interval: NaN,
            currentOffset: 0,
            hasBeenPlayed: false,
        };
    }

    componentDidMount() {
        const bins = this.wave.querySelectorAll('#Rectangle-path rect');

        this.audio.addEventListener('timeupdate', this.onTimeUpdate);
        // this should fire on Firefox
        this.audio.addEventListener('ended', this.resetAudio);

        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState(
            {
                bins,
            },
            () => {
                if (Number.isNaN(this.audio.duration)) {
                    this.audio.addEventListener('durationchange', this.ready, {
                        once: true,
                    });
                } else {
                    this.ready();
                }
            }
        );
    }

    onTimeUpdate = () => {
        const percentPlayed = Math.round(
            (this.audio.currentTime / this.state.duration) * 100
        );
        if (percentPlayed > this.state.currentOffset) {
            checkForTimeEvents(this.props.mediaId, percentPlayed);
        }

        // pause when it gets to the end
        if (this.audio.currentTime > this.state.duration - 1) {
            this.resetAudio();
        } else {
            this.incrementBlock(this.audio.currentTime);
            this.setState({
                currentTime: this.audio.currentTime,
                currentOffset: percentPlayed,
            });
        }
    };

    setAudio = (el: ?HTMLAudioElement) => {
        if (el) {
            this.audio = el;
        }
    };

    setWave = (el: ?HTMLElement) => {
        if (el) {
            this.wave = el;
        }
    };

    resetAudio = () => {
        this.setState({ playing: false });
        this.audio.pause();
    };

    audio: HTMLAudioElement;
    wave: HTMLElement;

    ready = () => {
        const duration = this.audio.duration;
        if (this.state.bins) {
            const interval = duration / this.state.bins.length;
            this.setState({
                ready: true,
                duration,
                interval,
            });
        }
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
            sendToOphan(this.props.mediaId, 'play');
            this.setState({ hasBeenPlayed: true });
        }
    };

    seekWave = (e: any) => {
        if (document.querySelector('.fake-wave')) {
            // $FlowFixMe
            const boxW = document.querySelector('.fake-wave').offsetWidth;
            const svg = document.querySelector('.fake-wave svg');
            // $FlowFixMe
            const leftOffset = svg.getBoundingClientRect().left;

            const clickedPos = e.clientX - leftOffset;
            const posPercentage = (clickedPos / boxW) * 100;

            this.seek(posPercentage);
        }
    };

    seek = (chosenPercent: number) => {
        const chosenTime = (this.audio.duration * chosenPercent) / 100;
        const checkedTime = Math.max(
            0,
            Math.min(this.state.duration, chosenTime)
        );
        this.updatePlayerTime(checkedTime);
    };

    updatePlayerTime = (currTime: number) => {
        this.audio.currentTime = currTime;
        this.incrementBlock(currTime);

        const currentOffset = Math.round(
            (currTime / this.state.duration) * 100
        );

        this.setState({
            currentTime: currTime,
            currentOffset,
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

    incrementBlock = (currentTime: number) => {
        const blocksToFill = Math.floor(currentTime / this.state.interval);

        if (this.state.bins) {
            this.state.bins.forEach((bin, i) => {
                if (i <= blocksToFill) {
                    bin.setAttribute(
                        'fill',
                        pillarsHighlight[this.props.pillar]
                    );
                } else {
                    bin.setAttribute('fill', palette.neutral[4]);
                }
            });
        }
    };

    mute = () => {
        this.setState({ muted: true });
        this.audio.volume = 0;
    };

    sound = () => {
        this.setState({ muted: false });
        this.audio.volume = 1;
    };

    render() {
        return (
            <AudioGrid>
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
                    {this.state.ready ? <Time t={this.state.duration} /> : ''}
                </TimeContainer>
                <WaveAndTrack>
                    <FakeWave onClick={this.seekWave} className="fake-wave">
                        <div
                            ref={this.setWave}
                            className="wave-holder"
                            dangerouslySetInnerHTML={{ __html: waveW.markup }}
                        />
                    </FakeWave>
                </WaveAndTrack>
                <Controls>
                    <JumpButton
                        onClick={this.backward}
                        disabled={!this.state.playing}
                        dangerouslySetInnerHTML={{
                            __html: this.state.playing
                                ? fastBackwardActive.markup
                                : fastBackward.markup,
                        }}
                    />
                    <PlayButton
                        pillarColor={pillarsHighlight[`${this.props.pillar}`]}
                        onClick={this.play}
                        dangerouslySetInnerHTML={{
                            __html: this.state.playing
                                ? pauseBtn.markup
                                : playBtn.markup,
                        }}
                    />
                    <JumpButton
                        onClick={this.forward}
                        disabled={!this.state.playing}>
                        <span
                            dangerouslySetInnerHTML={{
                                __html: this.state.playing
                                    ? fastForwardActive.markup
                                    : fastForward.markup,
                            }}
                        />
                    </JumpButton>
                </Controls>

                <Volume>
                    <VolumeButton
                        isVolume
                        isActive={!this.state.muted}
                        onClick={this.sound}
                        dangerouslySetInnerHTML={{ __html: volumeOn.markup }}
                    />
                    <VolumeButton
                        isVolume
                        isActive={this.state.muted}
                        onClick={this.mute}
                        dangerouslySetInnerHTML={{ __html: volumeOff.markup }}
                    />
                </Volume>

                <Download>
                    <a href={this.props.downloadUrl}>Download MP3</a>
                </Download>
            </AudioGrid>
        );
    }
}
