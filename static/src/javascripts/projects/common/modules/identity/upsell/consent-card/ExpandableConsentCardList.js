// @flow
import React, { Component } from 'preact-compat';
import { ConsentCardList } from './ConsentCardList';

type CollapsibleConsentCardListProps = {
    list: ConsentCardList,
};

class ExpandableConsentCardList extends Component<
    CollapsibleConsentCardListProps,
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

export { ExpandableConsentCardList };
