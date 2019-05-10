import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import StandardLayout from "../layout/StandardLayout";

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
    return <CircularProgress />;
  }

  return (
    <StandardLayout>
      <Typography variant="title">Patient {patientId}</Typography>

      {currentPatient && (
        <Typography>
          <pre>{JSON.stringify(currentPatient, null, 2)}</pre>
        </Typography>
      )}

      {currentPatientError && (
        <Typography color="error">
          <pre>{JSON.stringify(currentPatientError, null, 2)}</pre>
        </Typography>
      )}
    </StandardLayout>
  );
}

PatientDetailComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PatientDetailComponent);
