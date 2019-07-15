import React, { Fragment, useEffect } from "react";

import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import axios from "axios";

import { withRouter, BrowserRouter as Router, Route } from "react-router-dom";
import { MuiThemeProvider } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import AuthContainer from "./containers/AuthContainer";
import ConfigContainer from "./containers/ConfigContainer";
import HomeContainer from "./containers/HomeContainer";
import PatientContainer from "./containers/PatientContainer";
import PatientGpNotesContainer from "./containers/PatientGpNotesContainer";
import PatientObservationContainer from "./containers/PatientObservationContainer";
import PatientTransferPackContainer from "./containers/PatientTransferPackContainer";
import PatientDischargeSummaryContainer from "./containers/PatientDischargeSummaryContainer";

import NavigationComponent from "./components/NavigationComponent";
import HomeComponent from "./components/HomeComponent";
import ConfigComponent from "./components/ConfigComponent";
import LoginComponent from "./components/LoginComponent";
import PatientDetailComponent from "./components/PatientDetailComponent";
import PatientObservationComponent from "./components/PatientObservationComponent";
import PatientCreateGpNotesComponent from "./components/PatientCreateGpNotesComponent";
import PatientCreateDischargeComponent from "./components/PatientCreateDischargeComponent";
import PatientCreateTransferPackComponent from "./components/PatientCreateTransferPackComponent";

import { theme } from "./Theme";

import { PrivateRoute, PublicOnlyRoute } from "./Router.guards";
import StandardLayout from "./layout/StandardLayout";
import { authStore } from "./state/AuthState";

const Interceptor = withRouter(function(props, context) {
  useEffect(() => {
    axios.interceptors.response.use(
      response => response,
      error => {
        if (process.env.NODE_ENV !== "production") {
          return Promise.reject(error);
        }

        console.log("ERROR INTERCEPTOR", error.status);

        if (error.response) {
          switch (error.response.status) {
            case 401:
              authStore.updateSession(null);
              props.history.push(`/auth-error/${error.response.status}`);
              return;
            default:
              return;
          }
        }

        if (!error.response) {
          // Fatal error
          authStore.updateSession(null);
          props.history.push(`/auth-error/${error.toString()}`);
        }

        return Promise.reject(error);
      }
    );
  }, [props.history]);

  return null;
});

export default () => (
  <MuiPickersUtilsProvider utils={DateFnsUtils}>
    <MuiThemeProvider theme={theme}>
      <Router>
        <NavigationComponent />

        <Interceptor />

        <div style={{ paddingTop: 64 }}>
          <PrivateRoute exact path="/" component={() => <HomeContainer Layout={HomeComponent} />} />
          <PublicOnlyRoute exact path="/login" component={() => <AuthContainer Layout={LoginComponent} />} />
          <Route exact path="/config" component={() => <ConfigContainer Layout={ConfigComponent} />} />
          <PrivateRoute
            exact
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

          <PrivateRoute
            path="/patient/:patientId/notes"
            component={({ match }) => {
              const { params } = match;
              const { patientId } = params;
              return (
                <PatientContainer
                  patientId={patientId}
                  Layout={props => (
                    <PatientGpNotesContainer patientId={patientId} {...props} Layout={PatientCreateGpNotesComponent} />
                  )}
                />
              );
            }}
          />

          <PrivateRoute
            path="/patient/:patientId/transfer-pack"
            component={({ match }) => {
              const { params } = match;
              const { patientId } = params;
              return (
                <PatientContainer
                  patientId={patientId}
                  Layout={props => (
                    <PatientTransferPackContainer
                      patientId={patientId}
                      {...props}
                      Layout={PatientCreateTransferPackComponent}
                    />
                  )}
                />
              );
            }}
          />

          <PrivateRoute
            path="/patient/:patientId/discharge"
            component={({ match }) => {
              const { params } = match;
              const { patientId } = params;
              return (
                <PatientContainer
                  patientId={patientId}
                  Layout={props => (
                    <PatientDischargeSummaryContainer
                      patientId={patientId}
                      {...props}
                      Layout={PatientCreateDischargeComponent}
                    />
                  )}
                />
              );
            }}
          />

          <PublicOnlyRoute
            path="/auth-error/:message"
            component={({ match }) => {
              const { params } = match;
              const { message } = params;
              return (
                <StandardLayout>
                  <Typography style={{ textAlign: "left", marginBottom: 96 }} variant="h2" color="error">
                    {message}
                  </Typography>
                  <AuthContainer Layout={LoginComponent} />
                </StandardLayout>
              );
            }}
          />
        </div>
      </Router>
    </MuiThemeProvider>
  </MuiPickersUtilsProvider>
);
