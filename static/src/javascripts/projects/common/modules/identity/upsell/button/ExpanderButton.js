// @flow
import React from 'preact-compat';

type ExpanderButtonText = {
    more: string,
    less: string,
};

type ExpanderButtonProps = {
    isExpanded: boolean,
    onToggle: (state: boolean) => void,
    linkName: ?string,
    text: ?ExpanderButtonText,
};

const defaultExpanderButtonText = {
    more: 'More',
    less: 'Less',
};

const ExpanderButton = ({
    isExpanded,
    onToggle,
    linkName,
    text,
}: ExpanderButtonProps) => {
    return isExpanded ? (
        <button
            data-link-name={linkName ? `${linkName} : shrink` : null}
            className="manage-account__button manage-account__button--secondary"
            onClick={() => onToggle(false)}>
            {(text || defaultExpanderButtonText).less}
        </button>
    ) : (
        <button
            data-link-name={linkName ? `${linkName} : expand` : null}
            className="manage-account__button manage-account__button--secondary"
            onClick={() => onToggle(true)}>
            {(text || defaultExpanderButtonText).more}
        </button>
    );
};
export { ExpanderButton };
