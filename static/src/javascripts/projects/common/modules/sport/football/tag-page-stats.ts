import config from 'lib/config';
import fetchJSON from 'lib/fetch-json';
import reportError from 'lib/report-error';

export const tagPageStats = (): void => {
    const firstContainer = document.querySelector(
        '.js-insert-team-stats-after'
    );

    if (firstContainer) {
        fetchJSON(
            `/${config.get('page.pageId')}/fixtures-and-results-container`,
            {
                mode: 'cors',
            }
        )
            .then((container) => {
                if (container.html) {
                    firstContainer.insertAdjacentHTML(
                        'afterend',
                        container.html
                    );
                }
            })
            .catch((ex) => {
                reportError(ex, { feature: 'tag-fixtures' });
            });
    }
};
