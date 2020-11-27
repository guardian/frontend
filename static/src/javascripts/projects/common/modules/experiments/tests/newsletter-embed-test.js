// @flow

export const newsletterEmbeds: ABTest = {
    id: 'NewsletterEmbeds',
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
                iframes.forEach(
                    (ifrm) => {
                        const ifrmElement = (ifrm: HTMLIFrameElement)
                        const doc = ifrmElement.contentDocument ? ifrm.contentDocument : ifrm.contentWindow.document;
                        if (doc) {
                            const oldDesign = doc.querySelector('.js-ab-embed-old-design');
                            const newDesign = doc.querySelector('.js-ab-embed-new-design');
                            if (oldDesign && newDesign) {
                                oldDesign.classList.add("hide-element")
                                newDesign.classList.remove("hide-element")

                            }
                        }
                    })
            },
        },
        {
            id: 'control',
            test: (): void => {},
        }
    ],
};
