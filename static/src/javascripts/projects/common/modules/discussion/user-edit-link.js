import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';

const addEditLink = (containerEl) => {
    const myUserId = config.get('user.id');
    const pageUserId = containerEl.dataset.userid;

    const parentNode = containerEl.parentElement;

    if (parentNode && myUserId && myUserId === pageUserId) {
        const linkEl = document.createElement('a');
        linkEl.innerText = 'Edit your public profile';
        linkEl.dataset.linkName = 'comments : edit profile';
        linkEl.href = `${config.get('page.idUrl')}/public/edit`;
        linkEl.classList.add('u-underline');

        const holderEl = document.createElement('p');
        holderEl.appendChild(linkEl);
        holderEl.classList.add('user-profile__edit-link');

        fastdom.mutate(() => {
            containerEl.insertAdjacentElement('afterend', holderEl);
        });
    }
};

const initUserEditLink = () =>
    fastdom
        .measure(() =>
            Array.from(document.getElementsByClassName('user-profile__name'))
        )
        .then(names => {
            names.forEach(addEditLink);
        });

export { initUserEditLink };
