import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import { red } from "@material-ui/core/colors";

import DelayComponent from "./DelayComponent";
import AuthState from "../state/AuthState";
import PatientContainer from "../containers/PatientContainer";
import StandardLayout from "../layout/StandardLayout";

const styles = {
  list: {
    margin: "24px 0 48px"
  }
};

function HomeComponent({ classes, patientIds }) {
  return (
    <StandardLayout>
      <Typography variant="h6">Welcome</Typography>

      <List className={classes.list}>
        {patientIds.map(id => (
          <PatientContainer
            key={id}
            patientId={id}
            Layout={({ currentPatientError, currentPatient, currentPatientLoading }) => (
              <ListItem button component={Link} to={`/patient/${id}`}>
                <Typography variant="h6">Patient: {id}</Typography>

                {currentPatientLoading && (
                  <DelayComponent wait={100}>
                    <CircularProgress />
                  </DelayComponent>
                )}

                {currentPatient && <pre>{JSON.stringify(currentPatient, null, 2)}</pre>}
                {currentPatientError && (
                  <pre style={{ color: red[500] }}>{JSON.stringify(currentPatientError, null, 2)}</pre>
                )}
              </ListItem>
            )}
          />
        ))}
      </List>

      <div>
        <AuthState.Consumer>
          {({ handleLogout }) => (
            <Button onClick={handleLogout} color="secondary" variant="outlined">
              Logout
            </Button>
          )}
        </AuthState.Consumer>
      </div>
    </StandardLayout>
  );
}

HomeComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomeComponent);
