// @flow

import {
    Component,
    React,
    render,
} from '@guardian/dotcom-rendering/packages/guui';
import { AudioPlayer } from './AudioPlayer';
import { sendToOphan } from './utils';

type Props = {
    source: string,
    mediaId: string,
    downloadUrl: string,
    pillar: string,
};

class AudioContainer extends Component<Props, *> {
    render() {
        return (
            <AudioPlayer
                sourceUrl={this.props.source}
                mediaId={this.props.mediaId}
                downloadUrl={this.props.downloadUrl}
                barWidth={2}
                controls="controls"
                pillar={this.props.pillar}
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

        if (supportsCSSGrid) {
            sendToOphan(mediaId, 'ready');
        }

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
                    pillar={pillar}
                />
            ) : (
                <audio src={source} controls mediaId={mediaId}>
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
