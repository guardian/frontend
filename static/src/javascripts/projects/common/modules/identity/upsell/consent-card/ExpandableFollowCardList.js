// @flow
import React, { Component } from 'preact-compat';
import { FollowCardList } from './FollowCardList';
import type {CardLike} from "common/modules/identity/upsell/consent-card/FollowCard";

type ExpandableFollowCardListProps<T: CardLike> = {
    list: FollowCardList<T>,
};

class ExpandableFollowCardList<T: CardLike> extends Component<
    ExpandableFollowCardListProps<T>,
    {
        expanded: boolean,
    }
> {
    constructor(props: {}) {
        super(props);
        this.setState({
            expanded: false,
        });
    }
    render() {
        if (this.state.expanded) {
            return this.props.list;
        }
        return (
            <button
                className="identity-upsell-expandable-consent-card-list__expand-button"
                onClick={() => {
                    this.setState({ expanded: true });
                }}>
                Expand
            </button>
        );
    }
}

export { ExpandableFollowCardList };
