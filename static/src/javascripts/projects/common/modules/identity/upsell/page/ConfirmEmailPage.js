// @flow

import React from 'preact-compat';

import {NewsLetterSignUps} from "./NewsLetterSignUps";
import {OptOuts} from "./OptOuts";
import {Header} from "../header/Header";
import {AccountCreationBlock} from "../account-creation/AccountCreationBlock";

type Props = {
    csrfToken: string,
    accountToken: ?string,
    email: string,
    hasPassword: boolean,
    hasSocialLinks: boolean,
    isUserLoggedIn: boolean,
}

const getComponents = (props: Props): React.Component[] => {

    if (!props.hasPassword && !props.hasSocialLinks && props.accountToken) {
        return [
            <AccountCreationBlock csrfToken={props.csrfToken} accountToken={props.accountToken} email={props.email}/>,
            <NewsLetterSignUps/>,
            <OptOuts/>,
        ];
    }

    // TODO: currently we sign them in. Need to resolve this!
    if (!props.isUserLoggedIn) {
        // TODO: sign in form
        return [
            <NewsLetterSignUps/>,
            <OptOuts/>,
        ];
    }

    return [
        <NewsLetterSignUps/>,
        <OptOuts/>,
    ];
};


export const ConfirmEmailPage = (props: Props) => (
    <div>
        <Header
            title="Thank you!"
            subtitle="You’re now subscribed to your content"
        />
        <div className="identity-upsell-layout">
            { getComponents(props) }
        </div>
    </div>
);
