import fetch from 'lib/fetch';

const getTranscriptionToggleButton = (): ?HTMLElement => {
    const el = document.getElementsByClassName('js-show-podcast-transcript-button');
    return el && el[0];
};

const getTranscriptionElement = (): ?HTMLElement => {
    const el = document.getElementsByClassName('js-podcast-transcription');
    return el && el[0];
};

const isHidden = (transcriptionElement): boolean => {
    return transcriptionElement.classList.contains('is-hidden');
};

const retrieveTranscription = (url): ?String => {
    const s3Key = url.split('/')[4];
    // https://audio.guim.co.uk/2019/03/27-51922-gnl.chips.27032019.ds.voicelabs.mp3
    // 27-51922-gnl.chips.27032019.ds.voicelabs.mp31554805546246Out.txt
    const fetchUrl = `https://s3-eu-west-1.amazonaws.com/gu-transcribe-data/${s3Key}`;
    // return fetch(fetchUrl)
    //     .then(response => response.text);
    return 'wait for it!'

};

const toggleTranscriptionView = (transcriptionElement): void => {
    if (isHidden(transcriptionElement)) {
        transcriptionElement.classList.remove('is-hidden');
        transcriptionElement.setAttribute('aria-expanded', 'true');
        // retrieve the transcription if we can (and haven't already)
        if (transcriptionElement.innerHTML.length < 1) {
            const button = document.querySelector('.js-show-podcast-transcript-button > .js-button-text');
            const url = button && button.getAttribute('sourceUrl');
            const text = retrieveTranscription(url);
            transcriptionElement.innerHTML == text;
        }
    } else {
        transcriptionElement.classList.add('is-hidden');
        transcriptionElement.setAttribute('aria-expanded', 'false');
    }
};

const addEventHandler = (): void => {
    const transcriptionToggleButton = getTranscriptionToggleButton();
    const transcriptionElement = getTranscriptionElement();

    if (transcriptionToggleButton) {
        transcriptionToggleButton.addEventListener('click', (event: Event) => {
            const buttonSelector = '.js-show-podcast-transcript-button';
            const target: HTMLElement = (event.target: any);

            if (target.matches(buttonSelector) || (target.parentNode && target.parentNode.matches(buttonSelector))) {
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
