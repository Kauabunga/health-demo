import React, { Component } from "react";
import { observer } from "mobx-react";

import AuthState from "../state/AuthState";

class AuthContainer extends Component {
  static contextType = AuthState;

  render() {
    const { Layout } = this.props;
    const { isAuthenticated, handleLogin, authenticating } = this.context;

    return <Layout isAuthenticated={isAuthenticated} authenticating={authenticating} handleLogin={handleLogin} />;
  }
}

export default observer(AuthContainer);
