// @flow
import React, { Component } from 'preact-compat';

type ErrorBarProps = {
    errors: string[],
};

export const genericErrorStr = 'Oops! Something went wrong';

export class ErrorBar extends Component<ErrorBarProps> {
    render() {
        const { errors } = this.props;
        const TagName = 'div';
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
