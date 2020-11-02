// @flow

export const newsletterEmbeds: ABTest = {
    id: 'NewsletterEmbeds',
    start: '2020-11-02',
    expiry: '2020-12-01',
    author: 'Josh Buckland',
    description:
        'Show a new newsletter embed design',
    audience: 1,
    audienceOffset: 0.0,
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
                const iframes = document.querySelectorAll('.email-sub__iframe')
                iframes.forEach(
                    (ifrm) => {
                        ifrm.setAttribute("height", "224px")
                        const doc = ifrm.contentDocument ? ifrm.contentDocument : ifrm.contentWindow.document;
                        doc.querySelector('.js-ab-embed-old-design').classList.add("hide-element")
                        doc.querySelector('.js-ab-embed-new-design').classList.remove("hide-element")
                    })
            },
        },
    ],
};
