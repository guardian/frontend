// @flow

import React from 'preact-compat';

import { NewsLetterSignUps } from './NewsLetterSignUps';
import { OptOuts } from './OptOuts';
import { Header } from '../header/Header';
import { AccountCreationBlock } from '../account-creation/AccountCreationBlock';

type Props = {
    csrfToken: string,
    accountToken: ?string,
    email: string,
    hasPassword: boolean,
    hasSocialLinks: boolean,
    isUserLoggedIn: boolean,
};

export const ConfirmEmailPage = (props: Props) => {
    let components = [<NewsLetterSignUps />, <OptOuts />];

    if (!props.hasPassword && !props.hasSocialLinks && props.accountToken) {
        components = [
            <AccountCreationBlock
                csrfToken={props.csrfToken}
                accountToken={props.accountToken}
                email={props.email}
            />,
            <NewsLetterSignUps />,
            <OptOuts />,
        ];
    }

    // TODO: currently we sign them in. Need to resolve this!
    if (!props.isUserLoggedIn) {
        // TODO: sign in form
        components = [<NewsLetterSignUps />, <OptOuts />];
    }

    return (
        <div>
            <Header
                title="Thank you!"
                subtitle="You’re now subscribed to your content"
            />
            <div className="identity-upsell-layout">{components}</div>
        </div>
    );
};
