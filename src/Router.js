import React, { Fragment } from "react";

import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

import { BrowserRouter as Router, Route } from "react-router-dom";
import { MuiThemeProvider } from "@material-ui/core/styles";

import AuthContainer from "./containers/AuthContainer";
import ConfigContainer from "./containers/ConfigContainer";
import HomeContainer from "./containers/HomeContainer";
import PatientContainer from "./containers/PatientContainer";
import PatientObservationContainer from "./containers/PatientObservationContainer";

import NavigationComponent from "./components/NavigationComponent";
import HomeComponent from "./components/HomeComponent";
import ConfigComponent from "./components/ConfigComponent";
import LoginComponent from "./components/LoginComponent";
import PatientDetailComponent from "./components/PatientDetailComponent";
import PatientObservationComponent from "./components/PatientObservationComponent";

import { theme } from "./Theme";

import { PrivateRoute, PublicOnlyRoute } from "./Router.guards";

export default () => (
  <MuiPickersUtilsProvider utils={DateFnsUtils}>
    <MuiThemeProvider theme={theme}>
      <Router>
        <NavigationComponent />

        <div style={{ paddingTop: 64 }}>
          <PrivateRoute exact path="/" component={() => <HomeContainer Layout={HomeComponent} />} />
          <PublicOnlyRoute exact path="/login" component={() => <AuthContainer Layout={LoginComponent} />} />
          <Route exact path="/config" component={() => <ConfigContainer Layout={ConfigComponent} />} />
          <Route
            path="/patient/:patientId"
            component={({ match }) => {
              const { params } = match;
              const { patientId } = params;
              return (
                <Fragment>
                  <PatientContainer patientId={patientId} Layout={PatientDetailComponent} />
                  <PatientObservationContainer patientId={patientId} Layout={PatientObservationComponent} />
                </Fragment>
              );
            }}
          />
        </div>
      </Router>
    </MuiThemeProvider>
  </MuiPickersUtilsProvider>
);
