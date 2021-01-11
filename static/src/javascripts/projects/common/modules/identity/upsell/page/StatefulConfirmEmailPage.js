import React from 'preact-compat';
import { ConfirmEmailPage } from './ConfirmEmailPage';
import { getUserData } from '../../api';



const isUserLoggedIn = () =>
    getUserData().then(response => response.ok);

export class StatefulConfirmEmailPage extends React.Component {
    constructor(props) {
        super(props);
        this.setState({ isUserLoggedIn: false });
    }

    componentDidMount() {
        // For some reason using this.setState instead of an anonymous function doesn't work?
        isUserLoggedIn().then(status =>
            this.setState({ isUserLoggedIn: status })
        );
    }

    render() {
        return (
            <ConfirmEmailPage
                csrfToken={this.props.csrfToken}
                accountToken={this.props.accountToken}
                email={this.props.email}
                hasPassword={this.props.hasPassword}
                hasSocialLinks={this.props.hasSocialLinks}
                isUserLoggedIn={this.state.isUserLoggedIn}
            />
        );
    }
}
