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
    mobileMedium,
    mobileLandscape,
    phablet,
    tablet,
    leftCol,
    wide,
    mobile,
    desktop,
} from '@guardian/dotcom-rendering/packages/pasteup/breakpoints';

import download from 'svgs/journalism/audio-player/download.svg';
import pauseBtn from 'svgs/journalism/audio-player/pause-btn.svg';
import playBtn from 'svgs/journalism/audio-player/play-btn.svg';
import volume from 'svgs/journalism/audio-player/volume.svg';
import fastBackward from 'svgs/journalism/audio-player/fast-backward.svg';
import fastForward from 'svgs/journalism/audio-player/fast-forward.svg';
import fastBackwardActive from 'svgs/journalism/audio-player/fast-backward-active.svg';
import fastForwardActive from 'svgs/journalism/audio-player/fast-forward-active.svg';

import waveW from 'svgs/journalism/audio-player/wave-wide.svg';
import { formatTime, sendToOphan, checkForTimeEvents } from './utils';

import ProgressBar from './ProgressBar';
import Time from './Time';
import config from '../../../../lib/config';

const applePodcastImage =
    config.get('images.journalism.apple-podcast-logo') || '';

const AudioGrid = styled('div')({
    borderTop: '1px solid #767676',
    display: 'grid',
    backgroundColor: palette.neutral[1],
    color: palette.neutral[5],
    gridTemplateColumns: '6fr 4fr',
    gridTemplateRows: '30px 50px 94px 50px 1fr',
    gridTemplateAreas:
        '"currentTime duration" "wave wave" "controls controls" "volume download" "links links"',

    [mobile]: {
        gridTemplateColumns: '1fr 1fr',
    },

    [tablet]: {
        gridTemplateColumns: '150px 1fr 1fr',
        gridTemplateRows: '30px 50px 90px 1fr 1fr',
        gridTemplateAreas:
            '"currentTime currentTime duration" "wave wave wave" "controls controls controls" "volume volume volume" "download links links"',
    },

    [leftCol]: {
        gridTemplateRows: '30px 60px 1fr 1fr',
        gridTemplateAreas:
            '". currentTime duration" "controls wave wave" "volume . ." "download links links"',
    },

    [wide]: {
        gridTemplateRows: '30px 60px 2fr 1fr',
        gridTemplateColumns: '230px 1fr 1fr',
    },
});

const TimeContainer = styled('div')(({ area }) => ({
    [area === 'currentTime'
        ? 'borderLeft'
        : 'borderRight']: '1px solid #767676',
    [area === 'currentTime' ? 'paddingLeft' : 'paddingRight']: '4px',
    [area === 'currentTime' ? 'marginLeft' : 'marginRight']: '10px',
    gridArea: area,
    paddingTop: '4px',
    fontFamily: 'Guardian Text Sans Web',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: area === 'duration' ? 'flex-end' : 'flex-start',

    [leftCol]: {
        marginLeft: '0',
        marginRight: '0',
        [area === 'currentTime' ? 'paddingLeft' : 'paddingRight']: '8px',
    },
}));

const Controls = styled('div')({
    gridArea: 'controls',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '33px 0',
});

const WaveAndTrack = styled('div')({
    gridArea: 'wave',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '0 9px',
    cursor: 'pointer',
    maxWidth: '100%',
});

const Track = styled('div')({
    height: '12px',
    position: 'relative',
    top: '-4px',
});

const FakeWave = styled('div')({
    flex: 1,
    svg: {
        width: '100%',
        transform: `translate(0px, 20px)`,
        [mobileMedium]: {
            transform: `translate(0px, 18px)`,
        },
        [mobileLandscape]: {
            transform: `translate(0px, 16px)`,
        },
        [phablet]: {
            transform: `translate(0px, 11px)`,
        },
        [tablet]: {
            transform: `translate(0px, 8px)`,
        },
        [desktop]: {
            transform: `translate(0px, 10px)`,
        },
        [leftCol]: {
            transform: `translate(0px, 15px)`,
        },
        [wide]: {
            transform: `translate(0px, 16px)`,
        },
    },
});

const Volume = styled('div')({
    gridArea: 'volume',
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    borderTop: '1px solid #797979',
    borderRight: '1px solid #797979',
    svg: {
        fill: '#dcdcdc',
    },
    [tablet]: {
        borderRight: 'none',
    },
    [desktop]: {
        padding: '0 10px',
    },
    [leftCol]: {
        border: 'none',
    },
    [wide]: {
        padding: '30px 30px 24px 30px',
    },
    '> img': {
        marginRight: '6px',
    },
    'div[role="progressbar"]': {
        flex: 1,
    },
});

const Download = styled('div')({
    borderTop: '1px solid #767676',
    gridArea: 'download',
    fontFamily: 'Guardian Text Sans Web',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [tablet]: {
        justifyContent: 'flex-start',
        paddingLeft: '10px',
        paddingTop: '8px',
    },
    [wide]: {
        paddingLeft: '28px',
    },
    a: {
        color: '#cbcbcb', // TODO: add to the palette
        border: '1px solid rgba(118, 118, 118, 0.7)',
        borderRadius: '15px',
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0px 9px',
        fontSize: '12px',
        textDecoration: 'none',

        ':hover': {
            borderColor: '#ffffff',
        },
    },
    svg: {
        height: '18px',
        width: '18px',
        marginLeft: '6px',
        fill: '#dcdcdc',
    },
});

const Links = styled('div')({
    borderTop: '1px solid #767676',
    gridArea: 'links',
    padding: '10px 10px 0',
    fontWeight: 'bold',
    display: 'flex',
    flexDirection: 'column',

    [mobile]: {
        alignItems: 'baseline',
        flexDirection: 'row',
        paddingTop: 0,
        ul: {
            display: 'flex',
        },
        li: {
            marginLeft: '30px',
        },
    },
    [tablet]: {
        borderLeft: '1px solid #767676',
        alignItems: 'baseline',
        flexDirection: 'row',
        paddingTop: 0,
        ul: {
            display: 'flex',
        },
        li: {
            marginLeft: '30px',
        },
    },
    b: {
        fontSize: '16px',
        fontFamily: '"Guardian Egyptian Web",Georgia,serif',
        fontWeight: '900',
    },
    ul: {
        fontFamily: 'Guardian Text Sans Web',
        fontSize: '14px',
    },
    a: {
        color: '#cbcbcb', // TODO: add to the palette
    },
    li: {
        marginTop: '12px',
    },
    img: {
        marginRight: '6px',
        verticalAlign: 'middle',
        height: '18px',
    },
});

const Button = styled('button')(({ isPlay, pillarColor }) => ({
    background: 'none',
    border: 0,
    cursor: 'pointer',
    margin: 0,
    ':focus': {
        outline: 'none', // ಠ_ಠ
    },
    padding: isPlay ? '0 45px' : 0,
    svg: {
        width: isPlay ? '60px' : '26px',
        height: isPlay ? '60px' : '26px',
    },
    circle: {
        fill: pillarColor,
        stroke: pillarColor,
    },

    [leftCol]: {
        padding: isPlay ? '0 12px' : 0,
        svg: {
            width: isPlay ? '50px' : '24px',
            height: isPlay ? '50px' : '24px',
        },
    },

    [wide]: {
        padding: isPlay ? '0 20px' : 0,
        svg: {
            width: isPlay ? '74px' : '26px',
            height: isPlay ? '74px' : '26px',
        },
    },
}));

type Props = {
    sourceUrl: string,
    mediaId: string,
    downloadUrl: string,
    iTunesUrl: string,
    pillar: string,
};

type State = {
    ready: boolean,
    playing: boolean,
    currentTime: number,
    duration: number,
    volume: number,
    bins: ?NodeList<HTMLElement>,
    interval: number,
    currentOffset: number,
    hasBeenPlayed: boolean,
};

export default class AudioPlayer extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            ready: false,
            playing: false,
            currentTime: 0,
            duration: NaN,
            volume: NaN,
            bins: null,
            interval: NaN,
            currentOffset: 0,
            hasBeenPlayed: false,
        };
    }

    componentDidMount() {
        const bins = this.wave.querySelectorAll('#Rectangle-path rect');

        this.audio.addEventListener('volumechange', this.onVolumeChange);
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

    onVolumeChange = () => {
        this.setState({ volume: this.audio.volume });
    };

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
                volume: this.audio.volume,
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

    updateVolume = (v: number) => {
        this.audio.volume = v / 100;
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
                <Controls>
                    <Button
                        isPlay={false}
                        onClick={this.backward}
                        disabled={!this.state.playing}
                        dangerouslySetInnerHTML={{
                            __html: this.state.playing
                                ? fastBackwardActive.markup
                                : fastBackward.markup,
                        }}
                    />
                    <Button
                        isPlay
                        pillarColor={pillarsHighlight[`${this.props.pillar}`]}
                        onClick={this.play}
                        dangerouslySetInnerHTML={{
                            __html: this.state.playing
                                ? pauseBtn.markup
                                : playBtn.markup,
                        }}
                    />
                    <Button
                        isPlay={false}
                        onClick={this.forward}
                        disabled={!this.state.playing}>
                        <span
                            dangerouslySetInnerHTML={{
                                __html: this.state.playing
                                    ? fastForwardActive.markup
                                    : fastForward.markup,
                            }}
                        />
                    </Button>
                </Controls>
                <TimeContainer area="currentTime">
                    <Time t={this.state.currentTime} />
                </TimeContainer>
                <TimeContainer area="duration">
                    {this.state.ready ? <Time t={this.state.duration} /> : ''}
                </TimeContainer>
                <WaveAndTrack>
                    <FakeWave onClick={this.seekWave} className="fake-wave">
                        <span
                            ref={this.setWave}
                            className="wave-holder"
                            dangerouslySetInnerHTML={{ __html: waveW.markup }}
                        />
                    </FakeWave>
                    <Track>
                        <ProgressBar
                            barContext="playTime"
                            value={this.state.currentOffset}
                            formattedValue={formatTime(
                                this.state.currentOffset
                            )}
                            barHeight={4}
                            trackColor={
                                pillarsHighlight[`${this.props.pillar}`]
                            }
                            highlightColor={
                                pillarsHighlight[`${this.props.pillar}`]
                            }
                            backgroundColor={palette.neutral[4]}
                            onChange={this.seek}
                        />
                    </Track>
                </WaveAndTrack>
                {Number.isNaN(this.state.volume) ? (
                    ''
                ) : (
                    <Volume>
                        <span
                            dangerouslySetInnerHTML={{ __html: volume.markup }}
                        />
                        <ProgressBar
                            barContext="volume"
                            value={this.state.volume * 100}
                            formattedValue={`Volume set to ${
                                this.state.volume
                            }`}
                            barHeight={2}
                            trackColor={palette.neutral[7]}
                            highlightColor={
                                pillarsHighlight[`${this.props.pillar}`]
                            }
                            backgroundColor={palette.neutral[4]}
                            onChange={this.updateVolume}
                        />
                    </Volume>
                )}
                <Download>
                    <a href={this.props.downloadUrl}>
                        Download MP3
                        <span
                            dangerouslySetInnerHTML={{
                                __html: download.markup,
                            }}
                        />
                    </a>
                </Download>
                <Links>
                    <b>Subscribe for free</b>
                    <ul>
                        <li>
                            <a href={this.props.iTunesUrl}>
                                <img
                                    src={applePodcastImage}
                                    height="20px"
                                    alt=""
                                />
                                Apple Podcasts
                            </a>
                        </li>
                    </ul>
                </Links>
            </AudioGrid>
        );
    }
}
