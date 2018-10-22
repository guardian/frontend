// @flow

const renderContributionsBanner = el => {
    const container = document.createElement('section');
    const fcContainer = document.createElement('div');
    const fcContainerHead = document.createElement('div');
    const fcContainerBody = document.createElement('div');

    const header = document.createElement('h2');
    const text = document.createElement('p');
    const button = document.createElement('a');

    container.classList.add('flagship-audio__contributions-banner');
    container.classList.add('fc-container');
    fcContainer.classList.add('fc-container__inner');
    fcContainerBody.classList.add('fc-container--rolled-up-hide');
    fcContainerBody.classList.add('fc-container__body');
    fcContainerHead.classList.add('fc-container__header');

    fcContainerHead.textContent = ' ';
    header.textContent = 'Support The Guardian';
    text.innerHTML =
        'Help us deliver the independent <br/> journalism the world needs';

    button.classList.add('contributions__contribute');
    button.classList.add('contributions__option-button');
    button.textContent = 'Support the Guardian';
    button.setAttribute('data-link-name', 'audio-series-contributions');

    el.insertAdjacentElement('afterend', container);
    container.appendChild(fcContainer);
    fcContainer.appendChild(fcContainerHead);
    fcContainer.appendChild(fcContainerBody);
    fcContainerBody.appendChild(header);
    fcContainerBody.appendChild(text);
    fcContainerBody.appendChild(button);
};

export const addContributionsBanner = () => {
    const fifthEpisode = document.querySelector(
        'section.fc-container--tag:nth-of-type(7)'
    );

    if (fifthEpisode) {
        renderContributionsBanner(fifthEpisode);
    }
};
