import React from 'preact-compat';
import arrowDown from 'svgs/icon/arrow-down.svg';
import arrowUp from 'svgs/icon/arrow-up.svg';



const defaultExpanderButtonText = {
    more: 'More',
    less: 'Less',
};

const FollowCardExpanderButton = ({
    isExpanded,
    onToggle,
    linkName,
    text,
}) =>
    isExpanded ? (
        <button
            data-link-name={linkName ? `${linkName} : shrink` : null}
            className="manage-account__button manage-account__button--secondary manage-account__button--icon"
            onClick={() => onToggle(false)}>
            {(text || defaultExpanderButtonText).less}
            <span
                className="manage-account__button-react-icon"
                dangerouslySetInnerHTML={{ __html: arrowUp.markup }}
            />
        </button>
    ) : (
        <button
            data-link-name={linkName ? `${linkName} : expand` : null}
            className="manage-account__button manage-account__button--secondary manage-account__button--icon"
            onClick={() => onToggle(true)}>
            {(text || defaultExpanderButtonText).more}
            <span
                className="manage-account__button-react-icon"
                dangerouslySetInnerHTML={{ __html: arrowDown.markup }}
            />
        </button>
    );
export { FollowCardExpanderButton };
