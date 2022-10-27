import config from 'lib/config';
import { fetchJson } from 'lib/fetch-json';
import { reportError } from 'lib/report-error';

export const tagPageStats = () => {
    const firstContainer = document.querySelector(
        '.js-insert-team-stats-after'
    );

    if (firstContainer) {
        fetchJson(
            `/${config.get('page.pageId')}/fixtures-and-results-container`,
            {
                mode: 'cors',
            }
        )
            .then(container => {
                if (container.html) {
                    firstContainer.insertAdjacentHTML(
                        'afterend',
                        container.html
                    );
                }
            })
            .catch(ex => {
                reportError(ex, { feature: 'tag-fixtures' });
            });
    }
};
