// @flow
export const acquisitionsEpicThankYouTemplate = ({
    componentName,
    membershipUrl,
}: {
    componentName: string,
    membershipUrl: string,
}) =>
    `<div class="contributions__epic" data-component="${componentName}">
        <div>
            <h2 class="contributions__title">
                Thank you …
            </h2>
            <p>
                … for supporting us, by funding our independent journalism and helping to keep it open.
                Your contribution and the similar pledges of more than 800,000 readers around the world
                enables the Guardian’s journalists to find things out, reveal new information and challenge
                the powerful. Your knowledge and experience makes our reporting better too. Did you know
                we publish articles and podcasts for our supporters, featuring your views and voices?
            </p>
    
            <a href="${membershipUrl}" target="_blank" class="u-underline">You can learn more about how to get involved here.</a>
        </div>
    </div>`;
