// @flow

import React from 'preact-compat';
import { Block } from '../block/Block';
import { LegalTextBlock } from '../block/LegalTextBlock';
import { OptOutsList } from '../opt-outs/OptOutsList';

export const OptOuts = (): React.Component => (
    <Block
        sideBySideBackwards
        title="One more thing..."
        subtitle="These are your privacy settings. You’re in full control of them.">
        <LegalTextBlock>
            You can also change these settings any time by visiting our Emails &
            marketing section of your account.
        </LegalTextBlock>
        <OptOutsList />
    </Block>
);
