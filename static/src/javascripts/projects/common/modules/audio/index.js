// @flow

import React, { Component } from 'react';
import { render } from 'react-dom';
import { AudioPlayer } from './AudioPlayer';
import { sendToOphan, registerOphanListeners } from './utils';

type Props = {
    source: string,
    mediaId: string,
    duration: string,
};

class AudioContainer extends Component<Props, *> {
    render() {
        return (
            <AudioPlayer
                sourceUrl={this.props.source}
                mediaId={this.props.mediaId}
                duration={this.props.duration}
            />
        );
    }
}

const getPillar = pillarClass => {
    const pillarMatches = /pillar-([a-z]+)/g.exec(pillarClass);
    const pillar = pillarMatches ? pillarMatches[1].toLowerCase() : 'news';
    if (pillar === 'books' || pillar === 'arts') return 'culture';
    return pillar;
};

const supportsCSSGrid =
    window.CSS && window.CSS.supports && window.CSS.supports('display', 'grid');

const init = (): void => {
    const placeholder: ?HTMLElement = document.getElementById(
        'audio-component-container'
    );
    const article = document.getElementsByTagName('article')[0];

    if (placeholder && article) {
        const source = placeholder.dataset.source;
        const mediaId = placeholder.dataset.mediaId;
        const downloadUrl = placeholder.dataset.downloadUrl;
        const duration = placeholder.dataset.duration;

        sendToOphan(mediaId, 'ready');

        const pillarClassName = Array.from(article.classList).filter(x =>
            x.includes('pillar')
        )[0];
        const pillar = getPillar(pillarClassName);

        render(
            supportsCSSGrid ? (
                <AudioContainer
                    source={source}
                    mediaId={mediaId}
                    downloadUrl={downloadUrl}
                    duration={duration}
                    pillar={pillar}
                />
            ) : (
                <audio
                    src={source}
                    controls
                    data-media-id={mediaId}
                    ref={el => {
                        if (el) registerOphanListeners(el);
                    }}>
                    <track
                        src={source}
                        kind="captions"
                        srcLang="en"
                        label="English"
                    />
                    <p>
                        Sorry your browser does not support audio, here is
                        <a href={source}>a link to the audio</a> instead.
                    </p>
                </audio>
            ),
            placeholder
        );
    }
};

export { init };
