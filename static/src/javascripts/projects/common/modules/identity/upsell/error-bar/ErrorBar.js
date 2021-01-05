import React, { Component } from 'preact-compat';


export const genericErrorStr = 'Oops! Something went wrong';

export class ErrorBar extends Component {
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
