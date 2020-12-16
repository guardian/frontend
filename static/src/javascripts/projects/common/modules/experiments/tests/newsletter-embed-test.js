// @flow
import ophan from 'ophan/ng';

const abTestName = 'NewsletterEmbeds3'

const trackComponentInOphan = (newsletterId: string, variant: string) => {
    ophan.record({
        componentEvent: {
            action: 'INSERT',
            component: {
                componentType: 'NEWSLETTER_SUBSCRIPTION',
                id: newsletterId
            },
            abTest: {
                name: abTestName,
                variant
            }
        }
    });
};

const triggerVariant = (doc: Document, iframeId: string) => {
    const oldDesign = doc.querySelector('.js-ab-embed-old-design');
    const newDesign = doc.querySelector('.js-ab-embed-new-design');
    if (oldDesign && newDesign) {
        oldDesign.classList.add("hide-element");
        newDesign.classList.remove("hide-element");
        trackComponentInOphan(iframeId, 'variant');
    }
};

export const newsletterEmbeds: ABTest = {
    id: abTestName,
    start: '2020-12-02',
    expiry: '2021-01-04',
    author: 'Josh Buckland',
    description:
        'Show a new newsletter embed design',
    audience: 1.0,
    audienceOffset: 0,
    successMeasure: 'We see increased engagement from users shown the new design',
    audienceCriteria:
        'Website users only.',
    ophanComponentId: 'newsletter_embed',
    dataLinkNames: 'n/a',
    idealOutcome:
        'Increase engagement for lighthouse segments 4 and 5 via newsletters',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'variant',
            test: (): void => {
                const iframes = ((document.querySelectorAll('.email-sub__iframe'): NodeList<any>): NodeList<HTMLIFrameElement>);
                if (iframes) {
                    iframes.forEach((ifrm: HTMLIFrameElement) => {
                        if (ifrm.id !== 'footer__email-form') {
                            const doc = ifrm.contentDocument ? ifrm.contentDocument : ifrm.contentWindow.document;
                            if (doc) {
                                if (doc.readyState !== 'complete') {
                                    window.addEventListener('load', () => triggerVariant(doc, ifrm.id));
                                } else {
                                    triggerVariant(doc, ifrm.id);
                                }
                            }
                        }
                    });
                }
            },
        },
        {
            id: 'control',
            test: (): void => {
                const iframes = ((document.querySelectorAll('.email-sub__iframe'): NodeList<any>): NodeList<HTMLIFrameElement>);
                if (iframes) {
                    iframes.forEach((ifrm: HTMLIFrameElement) => {
                        if (ifrm.id !== 'footer__email-form') {
                            trackComponentInOphan(ifrm.id, 'control');
                        }
                    });
                }
            },
        }
    ],
};
