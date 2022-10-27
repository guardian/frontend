import fastdom from 'fastdom';
import $ from 'lib/$';
import { fetchJson } from 'lib/fetch-json';
import { reportError } from 'lib/report-error';

const ELEMENT_INITIAL_CLASS = 'element-membership--not-upgraded';
const ELEMENT_UPGRADED_CLASS = 'element-membership--upgraded';

const upgradeEvent = (el) => {
    const href = $('a', el).attr('href');
    const matches = href.match(/https:\/\/membership.theguardian.com/);

    if (matches) {
        fetchJson(`${href}/card`, {
            mode: 'cors',
        })
            .then(resp => {
                if (resp.html) {
                    fastdom.mutate(() => {
                        $(el)
                            .html(resp.html)
                            .removeClass(ELEMENT_INITIAL_CLASS)
                            .addClass(ELEMENT_UPGRADED_CLASS);
                    });
                }
            })
            .catch(ex => {
                reportError(ex, {
                    feature: 'membership-events',
                });
            });
    }
};

export const upgradeMembershipEvents = () => {
    $(`.${ELEMENT_INITIAL_CLASS}`).each(upgradeEvent);
};
