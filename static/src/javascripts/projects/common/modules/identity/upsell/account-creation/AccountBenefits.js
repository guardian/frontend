import React, { Component } from 'preact-compat';

const benefits = [
    {
        title: `Get closer to our journalism `,
        blurb: `Choose from over 40 exclusive newsletters on the variety of topics. Get exclusive offers.`
    },
    {
        title: `Join the conversation  `,
        blurb: `Comment on articles and make your voice heard.`
    },
    {
        title: `Take your career to the next level`,
        blurb: `Create your jobseeker profile and receive job alerts.`
    },
    {
        title: `Enjoy our free iOS and Android apps`,
        blurb: ` Save articles for later, tailor your news and get notified about topics that matter to you.`
    },
];

export const AccountBenefits = () => {
    return (
        <ul class={'identity-upsell-account-creation-bullets'}>
            {benefits.map(benefit=>(
                <li>
                    <h4>{benefit.title}</h4>
                    <p>{benefit.blurb}</p>
                </li>
            ))}
        </ul>
    )
}
