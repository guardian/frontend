// @flow
import { getLocalCurrencySymbol } from 'lib/geolocation';
import fetchJSON from 'lib/fetch-json';
import config from 'lib/config';

// control
const controlHeading = 'Since you’re here &hellip;';
const controlP1 =
    '&hellip; we have a small favour to ask. More people are reading the Guardian than ever but advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall &ndash; we want to keep our journalism as open as we can. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters &ndash; because it might well be your perspective, too.';
const controlP2FirstSentence =
    ' If everyone who reads our reporting, who likes it, helps fund it, our future would be much more secure.';
const controlP2 = (
    firstSentence: string,
    currencySymbol: string = getLocalCurrencySymbol()
) =>
    `${firstSentence} <strong><span class="contributions__highlight">For as little as ${currencySymbol}1, you can support the Guardian &ndash; and it only takes a minute. Thank you.</span></strong>`;

const ctaLinkSentence = (
    supportUrl: string,
    contributionUrl: string,
    currencySymbol: string
): string =>
    `<span class="contributions__highlight"> For as little as ${currencySymbol}1, you can support the Guardian – and it only takes a minute.</span> <a href="${supportUrl}" target="_blank" class="u-underline">Make a contribution</a>`;

const thankyouP2FirstSentence =
    'Thank you to the many people who have already supported us financially &ndash; your contribution is what makes stories like you’ve just read possible. We increasingly need our readers to fund our work so that we can continue holding power to account and producing fearless journalism.</br></br>';

const controlTestimonial = {
    text:
        'I appreciate there not being a paywall: it is more democratic for the media to be available for all and not a commodity to be purchased by a few. I’m happy to make a contribution so others with less means still have access to information.',
    name: 'Thomasine, Sweden',
};

/*
 Exported instances of AcquisitionsEpicTemplateCopy
 */
export const control: AcquisitionsEpicTemplateCopy = {
    heading: controlHeading,
    p1: controlP1,
    p2: controlP2(controlP2FirstSentence),
    testimonial: controlTestimonial,
};

export const thankyou = {
    heading: controlHeading,
    p1: controlP1,
    p2: controlP2(thankyouP2FirstSentence),
};

export const liveblogCopy = (
    supportUrl: string,
    contributionsUrl: string
): AcquisitionsEpicTemplateCopy => ({
    p1: `Since you’re here ${controlP1}`,
    p2: `${controlP2FirstSentence} ${ctaLinkSentence(
        supportUrl,
        contributionsUrl,
        getLocalCurrencySymbol()
    )}. - Guardian HQ`,
});

export const getCopyFromGoogleDoc = (
    sheetName: string
): Promise<AcquisitionsEpicTemplateCopy> => {
    const url = config.get('page.isDev')
        ? 'https://interactive.guim.co.uk/docsdata-test/1Hoqzg-LeB0xJf2z0JwsfDTHdXKtq-7O5DsQhpqRm7ho.json'
        : 'https://interactive.guim.co.uk/docsdata/1Hoqzg-LeB0xJf2z0JwsfDTHdXKtq-7O5DsQhpqRm7ho.json';

    return fetchJSON(url, {
        mode: 'cors',
    }).then(res => {
        const rows = res && res.sheets && res.sheets[sheetName];
        const row = rows && rows[0];

        if (row.heading && row.p1 && row.p2) {
            let testimonial = {};
            if (row.testimonialText && row.testimonialName) {
                testimonial = {
                    testimonial: {
                        text: row.testimonialText,
                        name: row.testimonialName,
                    },
                };
            }
            return {
                heading: row.heading,
                p1: row.p1,
                p2: controlP2(row.p2),
                ...testimonial,
            };
        }
        return control;
    });
};
