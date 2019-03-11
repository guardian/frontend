// @flow
import React, { Component } from 'preact-compat';

type ErrorBarProps = {
    errors: string[],
    tagName?: string,
};

export const genericErrorStr = 'Oops! Something went wrong';

export class ErrorBar extends Component<ErrorBarProps> {
    static defaultProps = {
        tagName: 'div',
    };

    render() {
        const { errors } = this.props;
        const TagName = this.props.tagName;
        return (
            <TagName aria-live="polite">
                {errors.map(error => (
                    <div className="form__error" role="alert">
                        {error}
                    </div>
                ))}
            </TagName>
        );
    }
}
