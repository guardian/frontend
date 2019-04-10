// @flow
import fetch from 'lib/fetch';

const getTranscriptionToggleButton = (): ?HTMLElement => {
    const el = document.getElementsByClassName(
        'js-show-podcast-transcript-button'
    );
    return el && el[0];
};

const getTranscriptionElement = (): ?HTMLElement => {
    const el = document.getElementsByClassName('js-podcast-transcription');
    return el && el[0];
};

const isHidden = (transcriptionElement: HTMLElement): boolean =>
    transcriptionElement.classList.contains('is-hidden');

const retrieveTranscription = (url: string): Promise<string> => {
    const urEls = url.split('/');
    const s3Key = urEls[urEls.length - 1];
    const fetchUrl = `https://s3-eu-west-1.amazonaws.com/gu-transcribe-data/${s3Key.replace(
        '.mp3',
        '.txt'
    )}`;
    return fetch(fetchUrl).then(resp => {
        if (resp.ok) {
            return resp.text();
        }
        throw new Error(
            `Fetch error while requesting ${fetchUrl}: ${resp.statusText}`
        );
    });
};

const replacer = (match, spkNum, para) => {
    const odd = spkNum % 2 !== 0;
    return `<div class="transcription-speaker${
        odd ? '-odd' : '-even'
    }"><strong>Speaker ${spkNum}</strong></div><div class="transcription-paragraph">${para}</div><div>&nbsp;</div>`;
};

const cleaner = (originalText): string => {
    const re = /Speaker.?(\d*):.?(.*)(\r\n)?/gi;
    return originalText.replace(re, replacer);
};

const toggleTranscriptionView = (transcriptionElement: ?HTMLElement): void => {
    if (transcriptionElement) {
        if (isHidden(transcriptionElement)) {
            transcriptionElement.classList.remove('is-hidden');
            transcriptionElement.setAttribute('aria-expanded', 'true');
            // retrieve the transcription if we can (and haven't already)
            if (transcriptionElement.innerHTML.trim().length < 1) {
                const button = document.querySelector(
                    '.js-show-podcast-transcript-button > .js-button-text'
                );
                const url = button && button.getAttribute('sourceUrl');
                if (url) {
                    retrieveTranscription(url).then(text => {
                        if (transcriptionElement) {
                            transcriptionElement.innerHTML = cleaner(text);
                        }
                    });
                }
            }
        } else {
            transcriptionElement.classList.add('is-hidden');
            transcriptionElement.setAttribute('aria-expanded', 'false');
        }
    }
};

const addEventHandler = (): void => {
    const transcriptionToggleButton = getTranscriptionToggleButton();
    const transcriptionElement = getTranscriptionElement();

    if (transcriptionToggleButton) {
        transcriptionToggleButton.addEventListener('click', (event: Event) => {
            const buttonSelector = '.js-show-podcast-transcript-button';
            const target: HTMLElement = (event.target: any);
            if (
                target.matches(buttonSelector) ||
                (target.parentElement &&
                    target.parentElement.matches(buttonSelector))
            ) {
                event.preventDefault();
                event.stopPropagation();
                toggleTranscriptionView(transcriptionElement);
            }
        });
    }
};

export const transcriptionExpanderInit = (): void => {
    addEventHandler();
};
