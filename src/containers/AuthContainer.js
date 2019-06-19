import React, { Component } from "react";
import { observer } from "mobx-react";

import AuthState from "../state/AuthState";

class AuthContainer extends Component {
  static contextType = AuthState;

  render() {
    const { Layout } = this.props;
    const { isAuthenticated, errorMessage, handleLogout, handleLogin, authenticating } = this.context;

    return (
      <Layout
        errorMessage={errorMessage}
        isAuthenticated={isAuthenticated}
        authenticating={authenticating}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    );
  }
}

export default observer(AuthContainer);
