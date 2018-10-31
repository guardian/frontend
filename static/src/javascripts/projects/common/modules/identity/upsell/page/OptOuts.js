// @flow

import React from 'preact-compat';
import { Block } from '../block/Block';
import { LegalTextBlock } from '../block/LegalTextBlock';
import { OptOutsList } from '../opt-outs/OptOutsList';

export const OptOuts = (): React.Component => (
    <Block
        sideBySideBackwards
        title="Your communication preferences">
        <LegalTextBlock>
            You can also change these settings later by visiting the Emails &
            marketing section of your account.
        </LegalTextBlock>
        <OptOutsList />
    </Block>
);
