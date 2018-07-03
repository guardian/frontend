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
});

const Track = styled('div')({
    height: '12px',
    position: 'relative',
    top: '-4px',
});

const Wave = styled('svg')({
    flex: 1,
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
    barWidth: number,
    pillar: string,
};

type State = {
    ready: boolean,
    playing: boolean,
    currentTime: number,
    iteration: number,
    duration: number,
    volume: number,
    bins: Array<number>,
    interval: number,
    currentOffset: number,
    canvasH: number,
    sampler?: ?IntervalID,
    hasBeenPlayed: boolean,
};

export default class AudioPlayer extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            ready: false,
            playing: false,
            currentTime: 0,
            iteration: 0,
            duration: NaN,
            volume: NaN,
            bins: [],
            interval: NaN,
            currentOffset: 0,
            canvasH: 0,
            hasBeenPlayed: false,
        };
    }

    componentDidMount() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
        const nbins = Math.floor(rect.width / 3);
        this.audio.addEventListener('volumechange', this.onVolumeChange);
        this.audio.addEventListener('timeupdate', this.onTimeUpdate);
        this.context = new window.AudioContext();
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.source = this.context.createMediaElementSource(this.audio);
        this.source.connect(this.analyser);
        this.analyser.connect(this.context.destination);
        this.audio.crossOrigin = 'anonymous';

        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState(
            {
                bins: new Array(nbins)
                    .fill(0, 0, nbins)
                    .map(() => Math.floor(Math.random() * rect.height * 0.8)),
                canvasH: rect.height,
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
        this.setState({
            currentTime: this.audio.currentTime,
            currentOffset: percentPlayed,
        });
    };

    setCanvas = (el: ?HTMLElement) => {
        if (el) {
            this.canvas = el;
        }
    };

    setAudio = (el: ?HTMLAudioElement) => {
        if (el) {
            this.audio = el;
        }
    };

    dataArray: Uint8Array;
    source: MediaElementAudioSourceNode;
    analyser: AnalyserNode;
    audio: HTMLAudioElement;
    canvas: HTMLElement;

    ready = () => {
        const duration = this.audio.duration;
        const interval = duration / this.state.bins.length;
        this.setState({
            ready: true,
            duration,
            interval,
            volume: this.audio.volume,
        });
    };

    play = () => {
        this.setState(
            {
                playing: !this.state.playing,
            },
            () => {
                if (this.state.playing) {
                    this.audio.play();
                    this.sample();
                    this.setState({
                        sampler: window.setInterval(
                            this.sample,
                            this.state.interval * 1000
                        ),
                    });
                } else {
                    this.audio.pause();
                    window.clearInterval(this.state.sampler);
                    this.setState({ sampler: null });
                }
            }
        );
        if (!this.state.hasBeenPlayed) {
            sendToOphan(this.props.mediaId, 'play');
            this.setState({ hasBeenPlayed: true });
        }
    };

    forward = () => {
        const chosenTime = Math.min(
            this.state.currentTime + 15,
            this.state.duration
        );
        this.audio.currentTime = chosenTime;

        this.setState({
            iteration:
                Math.floor(
                    (this.state.bins.length * chosenTime) / this.state.duration
                ) - 1,
        });
    };

    backward = () => {
        const chosenTime = Math.max(this.state.currentTime - 15, 0);
        this.audio.currentTime = chosenTime;
        this.setState({
            iteration:
                Math.floor(
                    (this.state.bins.length * chosenTime) / this.state.duration
                ) - 1,
        });
    };

    updateVolume = (v: number) => {
        this.audio.volume = v / 100;
    };

    seek = (chosenTime: number) => {
        this.audio.currentTime = (this.audio.duration * chosenTime) / 100;
        this.setState({
            iteration:
                Math.floor((this.state.bins.length * chosenTime) / 100) - 1,
        });
    };

    sample = () => {
        this.analyser.getByteFrequencyData(this.dataArray);
        const factor = Math.max(1, ...this.dataArray);
        const mean =
            this.dataArray.reduce((res, x) => res + x, 0) /
            this.dataArray.length;
        const minHeight = 5;
        const barHeight =
            minHeight +
            Math.ceil((mean / factor) * (this.state.canvasH - minHeight));
        const bins = this.state.bins;
        bins[this.state.iteration] = barHeight;
        this.setState({
            bins,
            iteration: this.state.iteration + 1,
        });
    };

    render() {
        return (
            <AudioGrid>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio
                    ref={this.setAudio}
                    data-media-id={this.props.mediaId}
                    preload="metadata">
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
                    <Wave
                        innerRef={this.setCanvas}
                        colour={pillarsHighlight[`${this.props.pillar}`]}>
                        {this.state.ready
                            ? this.state.bins.map(
                                  (barHeight, i) =>
                                      i < this.state.iteration ? (
                                          <rect
                                              x={i * (this.props.barWidth + 1)}
                                              y={this.state.canvasH - barHeight}
                                              width={this.props.barWidth}
                                              height={barHeight}
                                              fill={
                                                  pillarsHighlight[
                                                      `${this.props.pillar}`
                                                  ]
                                              }
                                          />
                                      ) : i < this.state.iteration + 1 ? (
                                          <rect
                                              x={i * (this.props.barWidth + 1)}
                                              y={this.state.canvasH}
                                              width={this.props.barWidth}
                                              height={0}
                                              fill={palette.neutral[4]}
                                          />
                                      ) : (
                                          <rect
                                              x={i * (this.props.barWidth + 1)}
                                              y={this.state.canvasH - barHeight}
                                              width={this.props.barWidth}
                                              height={barHeight}
                                              fill={palette.neutral[4]}
                                          />
                                      )
                              )
                            : ''}
                    </Wave>
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
                                Apple podcast
                            </a>
                        </li>
                    </ul>
                </Links>
            </AudioGrid>
        );
    }
}
