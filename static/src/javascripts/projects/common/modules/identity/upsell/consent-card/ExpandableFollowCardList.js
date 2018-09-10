// @flow
import React, { Component } from 'preact-compat';
import { FollowCardList } from './FollowCardList';

type ExpandableConsentCardListProps = {
    list: FollowCardList,
};

class ExpandableFollowCardList extends Component<
    ExpandableConsentCardListProps,
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
