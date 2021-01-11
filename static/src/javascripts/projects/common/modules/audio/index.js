import React, { Component } from 'react';
import { render } from 'react-dom';
import {
    onConsentChange,
    getConsentFor,
} from '@guardian/consent-management-platform';
import { isAdFreeUser } from 'common/modules/commercial/user-features';
import config from 'lib/config';
import { AudioPlayer } from './AudioPlayer';
import { sendToOphan, registerOphanListeners } from './utils';



class AudioContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            acastConsent: false,
        };
    }

    componentDidMount() {
        onConsentChange(consentState => {
            const acast = getConsentFor('acast', consentState);
            this.setState({
                acastConsent: acast,
            });
        });
    }

    render() {
        const acastEnabled = config.get('switches.acast');
        const isPodcast = config.get('page.isPodcast');
        const sourceUrl =
            acastEnabled &&
            isPodcast &&
            this.state.acastConsent &&
            !isAdFreeUser()
                ? this.props.source.replace(
                      'https://',
                      'https://flex.acast.com/'
                  )
                : this.props.source;

        return (
            <AudioPlayer
                sourceUrl={sourceUrl}
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

const init = () => {
    const placeholder = document.getElementById(
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
