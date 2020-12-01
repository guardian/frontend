

import React from "preact-compat";
import { Block } from "../block/Block";
import { FollowCardList } from "../consent-card/FollowCardList";

export const NewsLetterSignUps = (): React.Component => <Block title="Guardian favourites:">
        <FollowCardList cutoff={2} />
    </Block>;