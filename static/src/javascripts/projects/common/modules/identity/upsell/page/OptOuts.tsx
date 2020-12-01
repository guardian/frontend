

import React from "preact-compat";
import { Block } from "../block/Block";
import { OptOutsList } from "../opt-outs/OptOutsList";

export const OptOuts = (): React.Component => <Block halfWidth sideBySideBackwards title="Your marketing preferences" subtext="We may contact you by telephone and post about our products and services (if you've previously given
        us your number and address). We may also contact you for market research purposes and use your data for
        marketing analysis.">
        <OptOutsList />
    </Block>;