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

// If we have one function argument - props: Props -
// eslint will complain about prop fields not being used :/
const getComponents = (
    csrfToken: string,
    accountToken: ?string,
    email: string,
    hasPassword: boolean,
    hasSocialLinks: boolean,
    isUserLoggedIn: boolean
): React.Component[] => {
    if (!hasPassword && !hasSocialLinks && accountToken) {
        return [
            <AccountCreationBlock
                csrfToken={csrfToken}
                accountToken={accountToken}
                email={email}
            />,
            <NewsLetterSignUps />,
            <OptOuts />,
        ];
    }

    // TODO: currently we sign them in. Need to resolve this!
    if (!isUserLoggedIn) {
        // TODO: sign in form
        return [<NewsLetterSignUps />, <OptOuts />];
    }

    return [<NewsLetterSignUps />, <OptOuts />];
};

export const ConfirmEmailPage = (props: Props) => (
    <div>
        <Header title="Thank you!" subtitle="You’re now subscribed" />
        <div className="identity-upsell-layout">
            {getComponents(
                props.csrfToken,
                props.accountToken,
                props.email,
                props.hasPassword,
                props.hasSocialLinks,
                props.isUserLoggedIn
            )}
        </div>
    </div>
);
