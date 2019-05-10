import React from "react";
import { Redirect, Route } from "react-router-dom";

import AuthContainer from "./containers/AuthContainer";

export const PrivateRoute = ({ component: Component, ...rest }) => (
  <AuthContainer
    Layout={({ isAuthenticated }) => (
      <Route
        {...rest}
        render={props => (isAuthenticated === true ? <Component {...props} /> : <Redirect to="/login" />)}
      />
    )}
  />
);

export const PublicOnlyRoute = ({ component: Component, ...rest }) => (
  <AuthContainer
    Layout={({ isAuthenticated }) => (
      <Route {...rest} render={props => (isAuthenticated !== true ? <Component {...props} /> : <Redirect to="/" />)} />
    )}
  />
);
