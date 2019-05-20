import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
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

const DetailItem = ({ label, value }) => (
  <Grid item>
    <Typography>{label}</Typography>
    <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
      {value}
    </Typography>
  </Grid>
);

const DetailPatient = ({ currentPatient }) => (
  <Grid item style={{ paddingRight: 24 }}>
    <DetailItem label="Name" value={currentPatient.name} />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />
    <DetailItem label="Email" value={currentPatient.email} />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />
    <DetailItem label="Address" value={currentPatient.address} />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />
    <DetailItem label="Birth date" value={currentPatient.birthDate} />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />
    <DetailItem label="Gender" value={currentPatient.gender} />
  </Grid>
);

const DetailNotes = ({ notes }) => {
  const handleNoteSubmit = e => e.preventDefault();

  return (
    <Grid item style={{ flexGrow: 1, maxWidth: 400 }}>
      <Grid container direction="column">
        {notes &&
          notes.map(currentNote => (
            <Card key={currentNote.message}>
              <Typography>{currentNote.message || ""}</Typography>
            </Card>
          ))}
        <form onSubmit={handleNoteSubmit}>
          <TextField variant="outlined" label="Enter a note for the patient" multiline type="textarea" fullWidth />
          <Button style={{ marginTop: 12 }} variant="outlined">
            Add note
          </Button>
        </form>
      </Grid>
    </Grid>
  );
};

function PatientDetailComponent(props) {
  const { patientId, currentPatient, currentPatientLoading, currentPatientError } = props;

  if (currentPatientLoading) {
    return (
      <Grid container alignItems="center" justify="center">
        <DelayComponent wait={100}>
          <CircularProgress />
        </DelayComponent>
      </Grid>
    );
  }

  const notes = [{ message: "" }];

  return (
    <StandardLayout>
      <Typography variant="h6" gutterBottom>
        Patient {patientId}
      </Typography>

      {currentPatient && (
        <Card style={{ padding: 24 }}>
          <Grid container>
            <DetailPatient currentPatient={currentPatient} />

            <DetailNotes notes={notes} />
          </Grid>
        </Card>
      )}

      {currentPatientError && <pre style={{ color: red[500] }}>{JSON.stringify(currentPatientError, null, 2)}</pre>}

      <Button component={Link} to="/" variant="outlined" color="primary" style={{ marginTop: 12 }}>
        Back
      </Button>
    </StandardLayout>
  );
}

PatientDetailComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PatientDetailComponent);
