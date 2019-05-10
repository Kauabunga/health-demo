import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";

import StandardLayout from "../layout/StandardLayout";
import DelayComponent from "./DelayComponent";

const styles = {
  root: {
    flexGrow: 1
  },
  login: {
    marginTop: 24
  }
};

function PatientDetailComponent(props) {
  const { patientId, currentPatient, currentPatientLoading, currentPatientError } = props;

  if (currentPatientLoading) {
    return (
      <DelayComponent wait={100}>
        <CircularProgress />
      </DelayComponent>
    );
  }

  return (
    <StandardLayout>
      <Typography variant="h6">Patient {patientId}</Typography>

      {currentPatient && (
        <Typography>
          <pre>{JSON.stringify(currentPatient, null, 2)}</pre>
        </Typography>
      )}

      {currentPatientError && <pre style={{ color: red[500] }}>{JSON.stringify(currentPatientError, null, 2)}</pre>}

      <Button component={Link} to="/" variant="outlined" color="primary">
        Back
      </Button>
    </StandardLayout>
  );
}

PatientDetailComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PatientDetailComponent);
