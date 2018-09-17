// @flow
import React, { Component } from 'preact-compat';
import type { CardLike } from 'common/modules/identity/upsell/consent-card/FollowCard';
import { FollowCardList } from './FollowCardList';

type ExpandableFollowCardListProps<T: CardLike> = {
    list: FollowCardList<T>,
};

const ExpandButton = (props: { onClick: () => void, text: string }) => (
    <button
        className="identity-upsell-expandable-consent-card-list__expand-button"
        onClick={props.onClick}>
        {props.text}
    </button>
);

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
            return (
                <div>
                    {this.props.list}
                    <ExpandButton
                        onClick={() => {
                            this.setState({ expanded: false });
                        }}
                        text="Collapse"
                    />
                </div>
            );
        }
        return (
            <ExpandButton
                onClick={() => {
                    this.setState({ expanded: true });
                }}
                text="Expand"
            />
        );
    }
}

export { ExpandableFollowCardList };
