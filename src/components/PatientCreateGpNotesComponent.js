import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl from "@material-ui/core/FormControl";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";

import StandardLayout from "../layout/StandardLayout";
import DelayComponent from "./DelayComponent";

const carePlanOptions = [
  {
    label: "Temp",
    value: "Temp"
  },
  {
    label: "Weight",
    value: "Weight"
  },
  {
    label: "RR",
    value: "RR"
  },
  {
    label: "BP",
    value: "BP"
  }
];

const rootStyles = theme => ({
  columnContainer: {
    flexWrap: "wrap",
    [theme.breakpoints.up("md")]: {
      flexWrap: "nowrap"
    }
  }
});

const DetailNotes = ({
  currentNote,
  currentNoteMeasurement,
  setCurrentNoteMeasurement,
  handleNoteChange,
  handleAddNote,
  notes
}) => {
  return (
    <Grid item style={{ flexGrow: 1, flexShrink: 0, maxWidth: 420 }}>
      <Typography variant="h6" gutterBottom>
        Observations
      </Typography>

      <Grid container direction="column">
        {(notes || []).map(({ id, text }, index) => (
          <Card
            key={id || text}
            style={{
              marginBottom: 12,
              padding: 12
            }}
          >
            <Typography>{text || "unknown"}</Typography>
          </Card>
        ))}

        <Grid container wrap="nowrap">
          <Grid item style={{ flexGrow: 1, width: 100, marginRight: 12 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="outlined-age-simple">Measurement</InputLabel>
              <Select
                value={currentNoteMeasurement}
                onChange={e => setCurrentNoteMeasurement(e.target.value)}
                input={<OutlinedInput labelWidth={110} name="age" id="outlined-age-simple" />}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>

                {carePlanOptions.map(({ label, value }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item style={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              value={currentNote}
              onChange={handleNoteChange}
              variant="outlined"
              label="Enter patient observations"
              multiline
              type="textarea"
            />
          </Grid>
        </Grid>
        <Button style={{ marginTop: 12 }} size="large" variant="outlined" type="button" onClick={handleAddNote}>
          Add observation
        </Button>
      </Grid>
    </Grid>
  );
};

function PatientCreateGpNotesComponent(props) {
  const { patientId, currentPatient, currentPatientLoading, currentPatientError } = props;

  // TEXT
  const [carePlan, setPlan] = useState("");
  const [clinicalImpression, setClinicalImpression] = useState("");
  const [medicationRequest, setMedicationRequest] = useState("");
  const [procedure, setProcedure] = useState("");

  // NOTES

  const [currentNote, updateCurrentNote] = useState("");
  const [notes, updateNotes] = useState([]);
  const [currentNoteMeasurement, setCurrentNoteMeasurement] = React.useState("");

  const handleNoteChange = e => updateCurrentNote(e.target.value);
  const handleAddNote = () => {
    if (currentNote) {
      updateCurrentNote("");
      setCurrentNoteMeasurement("");
      const text = `${currentNoteMeasurement ? `${currentNoteMeasurement}: ` : ""}${currentNote}`;
      updateNotes([...notes, { text }]);
    }
  };

  const notesProps = {
    currentNoteMeasurement,
    setCurrentNoteMeasurement,
    currentNote,
    handleNoteChange,
    handleAddNote,
    notes
  };

  const handleSubmit = e => {
    e.preventDefault();
  };

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
      <form style={{ width: "100%" }} onSubmit={handleSubmit}>
        <Typography variant="h3" gutterBottom>
          Enter Consultation Notes
        </Typography>
        <Divider />
        <br />
        <br />

        {currentPatient && (
          <Grid container direction="row" alignItems="center" style={{ marginBottom: 12 }}>
            {(currentPatient && currentPatient.photo && (
              <Avatar alt={currentPatient.name} src={currentPatient.photo} />
            )) || <Avatar>{currentPatient.initials}</Avatar>}
            <Typography variant="h6" style={{ marginLeft: 8 }}>
              {currentPatient.name} (Patient {patientId})
            </Typography>
          </Grid>
        )}

        <br />

        <Grid container flexWrap="wrap">
          <Grid item style={{ flexGrow: 1, minWidth: 400, maxWidth: 500, marginRight: 24 }}>
            <Typography variant="h6" gutterBottom>
              Examination
            </Typography>
            <TextField
              value={procedure}
              onChange={e => setProcedure(e.target.value)}
              variant="outlined"
              label="Enter your assessment of the patient’s condition and diagnoses"
              multiline
              type="textarea"
              rows={4}
              fullWidth
            />

            <br />
            <br />
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <TextField
              value={clinicalImpression}
              onChange={e => setClinicalImpression(e.target.value)}
              variant="outlined"
              label="Describe any procedures or actions taken during the consultation"
              multiline
              rows={4}
              type="textarea"
              fullWidth
            />

            <br />
            <br />
            <Typography variant="h6" gutterBottom>
              Plan
            </Typography>
            <TextField
              value={carePlan}
              onChange={e => setPlan(e.target.value)}
              variant="outlined"
              label="Describe the required care for the diagnoses, for example interventions, services, and procedures"
              multiline
              rows={4}
              type="textarea"
              fullWidth
            />

            <br />
            <br />
            <Typography variant="h6" gutterBottom>
              Medication
            </Typography>
            <TextField
              value={medicationRequest}
              onChange={e => setMedicationRequest(e.target.value)}
              variant="outlined"
              label="Enter any required medications"
              multiline
              rows={4}
              type="textarea"
              fullWidth
            />
          </Grid>

          <DetailNotes {...notesProps} />
        </Grid>

        <br />

        <Button
          component={Link}
          to={`/patient/${patientId}`}
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          style={{ marginTop: 12, marginRight: 12 }}
        >
          Submit
        </Button>

        <Button
          component={Link}
          to={`/patient/${patientId}`}
          variant="outlined"
          color="primary"
          type="button"
          size="large"
          style={{ marginTop: 12 }}
        >
          Cancel
        </Button>

        <br />
        <br />
        <br />
        <br />
        {currentPatientError && (
          <pre style={{ color: red[500], width: "100%", overflowX: "scroll" }}>
            {JSON.stringify(currentPatientError, null, 2)}
          </pre>
        )}
      </form>
    </StandardLayout>
  );
}

PatientCreateGpNotesComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(rootStyles)(PatientCreateGpNotesComponent);
