import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";

import StandardLayout from "../layout/StandardLayout";
import DelayComponent from "./DelayComponent";
import PatientConditionContainer from "../containers/PatientConditionContainer";

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
    <Typography variant="subtitle1" style={{ fontWeight: 700 }} noWrap>
      {value || "unknown"}
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
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />
    <DetailItem label="Next of kin name" value={currentPatient.nextOfKin.name} />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />
    <DetailItem label="Next of kin contact" value={currentPatient.nextOfKin.phone || currentPatient.nextOfKin.email} />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />
    <DetailItem label="Marital status" value={currentPatient.maritalStatus} />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />
    <DetailItem label="Ethnicity" value={currentPatient.ethnicity} />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />
    <DetailItem label="Care plan" value={currentPatient.carePlan} />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />
  </Grid>
);

const DetailNotes = ({ notes: defaultNotes }) => {
  const handleNoteSubmit = e => e.preventDefault();

  const [currentNote, updateCurrentNote] = useState("");
  const [notes, updateNotes] = useState(defaultNotes || []);

  const handleNoteChange = e => updateCurrentNote(e.target.value);
  const handleAddNote = () => {
    updateCurrentNote("");
    updateNotes([...notes, { text: currentNote }]);
  };

  return (
    <Grid item style={{ flexGrow: 1, maxWidth: 380 }}>
      <Grid container direction="column">
        {(notes || []).map(({ id, text }) => (
          <Card key={id || text} style={{ marginBottom: 12, padding: 12 }}>
            <Typography>{text || "asdf"}</Typography>
          </Card>
        ))}

        <form onSubmit={handleNoteSubmit}>
          <TextField
            value={currentNote}
            onChange={handleNoteChange}
            variant="outlined"
            label="Enter a note for the patient"
            multiline
            type="textarea"
            fullWidth
          />
          <Button style={{ marginTop: 12 }} variant="outlined" onClick={handleAddNote}>
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

  return (
    <StandardLayout>
      {currentPatient && (
        <Grid container direction="row" alignItems="center" style={{ marginBottom: 12 }}>
          {(currentPatient && currentPatient.photo && (
            <Avatar alt={currentPatient.name} src={currentPatient.photo} />
          )) || <Avatar>{currentPatient.initials}</Avatar>}
          <Typography variant="h6" style={{ marginLeft: 8 }}>
            Patient {patientId}
          </Typography>
        </Grid>
      )}

      {currentPatient && (
        <Card style={{ padding: 24 }}>
          <Grid container>
            <DetailPatient currentPatient={currentPatient} />

            <PatientConditionContainer
              patientId={patientId}
              Layout={({ currentPatientCondition }) => {
                const { notes } = currentPatientCondition || {};

                return (currentPatientCondition && <DetailNotes notes={notes} />) || <CircularProgress />;
              }}
            />
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
