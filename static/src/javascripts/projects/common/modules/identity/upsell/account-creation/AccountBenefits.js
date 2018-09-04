// @flow
import React from 'preact-compat';
import config from 'lib/config';

type BenefitCta = {
    name: string,
    link: string,
};

type Benefit = {
    title: string,
    blurb: string,
};

type ActionableBenefit = Benefit & {
    cta: BenefitCta[],
};

const benefits: Benefit[] = [
    {
        title: `Get closer to our journalism`,
        blurb: `Choose from over 40 exclusive newsletters on the variety of topics. Get exclusive offers.`,
    },
    {
        title: `Join the conversation`,
        blurb: `Comment on articles and make your voice heard.`,
    },
    {
        title: `Take your career to the next level`,
        blurb: `Create your jobseeker profile and receive job alerts.`,
    },
    {
        title: `Enjoy our free iOS and Android apps`,
        blurb: `
Save articles for later, tailor your news and get notified about topics that matter to you.`,
    },
];

const actionableBenefits: ActionableBenefit[] = [
    {
        title: `Explore exclusive content`,
        blurb: `Browse through over 40 newsletters on the variety of topics or sign up for events, offers, holidays or supporter updates.`,
        cta: [
            {
                name: `Find newsletters you'll love`,
                link: `https://${config.get('page.host')}/email-newsletters`,
            },
        ],
    },
    {
        title: `Get closer to our journalism`,
        blurb: `Complete your Guardian profile, pick an article that sparks your interest and that has a little comment icon and join fellow Guardian readers.`,
        cta: [
            {
                name: `Go to The Guardian`,
                link: `https://${config.get('page.host')}/`,
            },
        ],
    },
    {
        title: `Take your career to the next level`,
        blurb: `Use your Guardian account to access and complete your Guardian Jobs profile. Browse jobs and set up alerts.`,
        cta: [
            {
                name: `Visit Guardian Jobs`,
                link: `https://jobs.theguardian.com/`,
            },
        ],
    },
    {
        title: `Download our award-winning app`,
        blurb: `Available on iOS and Android. Sign in with your Guardian account to use exclusive features such as mobile alerts when your favourite writers publish an article, or your favourite team scores.`,
        cta: [
            {
                name: `Get the Guardian App`,
                link: `https://${config.get(
                    'page.host'
                )}/technology/ng-interactive/2018/may/15/the-guardian-app`,
            },
        ],
    },
];

export const AccountActionableBenefits = () => (
    <ul className="identity-upsell-account-creation-superbullets">
        {actionableBenefits.map(({ title, blurb, cta }) => (
            <li>
                <h4>{title}</h4>
                <p>{blurb}</p>
                {cta.map(({ name, link }) => (
                    <a
                        data-link-name={`benefit : ${title}`}
                        href={link}
                        className="manage-account__button manage-account__button--light">
                        {name}
                    </a>
                ))}
            </li>
        ))}
    </ul>
);

export const AccountBenefits = () => (
    <ul className="identity-upsell-account-creation-bullets">
        {benefits.map(benefit => (
            <li>
                <h4>{benefit.title}</h4>
                <p>{benefit.blurb}</p>
            </li>
        ))}
    </ul>
);
