
import React, { Component } from "preact-compat";
import { AccountCreationForm } from "./AccountCreationForm";
import { AccountActionableBenefits, AccountBenefits } from "./AccountBenefits";
import { Block } from "../block/Block";

type AccountCreationBlockProps = {
  csrfToken: string;
  accountToken: string;
  email: string;
};

class AccountCreationBlock extends Component<AccountCreationBlockProps, {
  hasCreatedAccount?: boolean;
}> {

  onAccountCreated = () => {
    this.setState({
      hasCreatedAccount: true
    });
  };

  render() {
    return !this.state.hasCreatedAccount ? <Block sideBySide title="Want more from The Guardian?" subtitle="Create your account now to manage your preferences and explore your free benefits.">
                <AccountCreationForm {...this.props} onAccountCreated={this.onAccountCreated} />
                <div>
                    <AccountBenefits />
                </div>
            </Block> : <Block title="Start exploring your benefits">
                <AccountActionableBenefits />
            </Block>;
  }
}

export { AccountCreationBlock };