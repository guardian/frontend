import React from 'preact-compat';
import config from 'lib/config';




const benefits = [
    {
        title: `Get closer to our journalism`,
        blurb: `Choose from over 40 exclusive newsletters and updates on the variety of topics that matter to you.`,
    },
    {
        title: `Join the conversation`,
        blurb: `Get involved – post or recommend comments below an article.`,
    },
    {
        title: `Take your career to the next level `,
        blurb: `Browse a huge variety of jobs, create your jobseeker profile and receive job alerts for vacancies you want to hear about.`,
    },
    {
        title: `Enjoy our free iOS and Android apps`,
        blurb: `Save articles for later, tailor your news and get notified about topics that matter to you.`,
    },
];

const actionableBenefits = [
    {
        title: `Get closer to our journalism`,
        blurb: `Browse over 40 curated newsletters on a variety of topics - from daily news headlines to weekly culture highlights, and diverse dedicated topics like science, documentary films and fashion. You can also sign up to receive updates about Guardian events, holidays and offers.`,
        cta: [
            {
                name: `Find your favourite newsletter`,
                link: `${config.get('page.host')}/email-newsletters`,
            },
        ],
    },
    {
        title: `Join the conversation`,
        blurb: `We believe in having open debate and in giving readers a voice in our journalism. With your Guardian profile, you can recommend comments added by other Guardian readers at the bottom of the articles or contribute your thoughts for other readers to see. Complete your public profile and join the debate.`,
        cta: [
            {
                name: `Complete your profile`,
                link: `${config.get('page.idUrl')}/public/edit`,
            },
        ],
    },
    {
        title: `Download our award-winning app`,
        blurb: `Available on iOS and Android. Sign in with your Guardian account to use exclusive features such as ‘save for later’ or mobile alerts when your favourite writers publish an article, or your football team scores.`,
        cta: [
            {
                name: `Explore our apps`,
                link: `${config.get(
                    'page.host'
                )}/technology/ng-interactive/2018/may/15/the-guardian-app`,
            },
        ],
    },
    {
        title: `Take your career to the next level`,
        blurb: `Your account allows you to set up a Guardian Jobs profile, browse a huge variety of jobs and be the first to hear about vacancies in your preferred industry.`,
        cta: [
            {
                name: `Browse jobs`,
                link: `https://jobs.theguardian.com/`,
            },
        ],
    },
];

export const AccountActionableBenefits = () => (
    <ul className="identity-upsell-account-creation-bullets identity-upsell-account-creation-bullets--super">
        {actionableBenefits.map(({ title, blurb, cta }) => (
            <li>
                <h4 className="identity-upsell-account-creation-bullets__title">
                    {title}
                </h4>
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
                <h4 className="identity-upsell-account-creation-bullets__title">
                    {benefit.title}
                </h4>
                <p>{benefit.blurb}</p>
            </li>
        ))}
    </ul>
);
