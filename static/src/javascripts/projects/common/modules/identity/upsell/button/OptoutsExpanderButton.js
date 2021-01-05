import React from 'preact-compat';
import plus from 'svgs/icon/plus.svg';
import minus from 'svgs/icon/minus.svg';


const OptoutsExpanderButton = ({
    isExpanded,
    onToggle,
    linkName,
    text,
}) =>
    isExpanded ? (
        <button
            data-link-name={linkName ? `${linkName} : shrink` : null}
            className="manage-account__button manage-account__button--secondary manage-account__button--icon manage-account__button--long manage-account__button--long-expanded"
            onClick={() => onToggle(false)}>
            {text}
            <span
                className="manage-account__button-react-icon"
                dangerouslySetInnerHTML={{ __html: minus.markup }}
            />
        </button>
    ) : (
        <button
            data-link-name={linkName ? `${linkName} : expand` : null}
            className="manage-account__button manage-account__button--secondary manage-account__button--icon manage-account__button--long"
            onClick={() => onToggle(true)}>
            {text}
            <span
                className="manage-account__button-react-icon"
                dangerouslySetInnerHTML={{ __html: plus.markup }}
            />
        </button>
    );
export { OptoutsExpanderButton };
