// @flow

import React from 'preact-compat';
import { Block } from '../block/Block';
import { LegalTextBlock } from '../block/LegalTextBlock';
import { OptOutsList } from '../opt-outs/OptOutsList';

export const OptOuts = (): React.Component => (
    <Block sideBySideBackwards title="Your communication preferences">
        <LegalTextBlock>
            You can always change these preferences later by visiting your account settings.
        </LegalTextBlock>
        <OptOutsList />
    </Block>
);
