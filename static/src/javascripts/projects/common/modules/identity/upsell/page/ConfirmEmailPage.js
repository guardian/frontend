import React from 'preact/compat';

import { NewsLetterSignUps } from './NewsLetterSignUps';
import { OptOuts } from './OptOuts';
import { Header } from '../header/Header';
import { AccountCreationBlock } from '../account-creation/AccountCreationBlock';


const Components = (props) => {
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
    } else if (!props.isUserLoggedIn) {
        // TODO: sign in form
        components = [<NewsLetterSignUps />, <OptOuts />];
    }

    return <div className="identity-upsell-layout">{components}</div>;
};

export const ConfirmEmailPage = (props) => (
    <div className="identity-upsell-wrapper">
        <Header title="Thank you!" subtitle="You’re now subscribed." />
        <Components {...props} />
    </div>
);
