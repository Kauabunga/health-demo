import React from "react";
import PropTypes from "prop-types";
import { subDays, addDays } from "date-fns";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { DatePicker } from "@material-ui/pickers";

import StandardLayout from "../layout/StandardLayout";
import DelayComponent from "./DelayComponent";
import PatientObservationTableComponent from "./PatientObservationTableComponent";

const styles = theme => ({
  root: {
    width: "100%",
    marginTop: theme.spacing.unit * 3,
    overflowX: "auto"
  },
  table: {
    minWidth: 700
  }
});

function PatientObservationComponent(props) {
  const {
    patientId,
    start,
    end,
    loadPatientObservation,
    currentPatientObservation,
    currentPatientObservationLoading
  } = props;

  if (!currentPatientObservation) {
    return null;
  }

  const { rows } = currentPatientObservation || { rows: [] };

  const today = new Date().toISOString();
  const handleStartChange = date => loadPatientObservation(patientId, date.toISOString(), end);
  const handleEndChange = date => loadPatientObservation(patientId, start, date.toISOString());
  const handleLastWeek = () => loadPatientObservation(patientId, subDays(new Date(), 7).toISOString(), today);
  const handleThisWeek = () => loadPatientObservation(patientId, today, addDays(new Date(), 7).toISOString());
  const handleNextWeek = () =>
    loadPatientObservation(patientId, addDays(new Date(), 7).toISOString(), addDays(new Date(), 14).toISOString());

  // const createSortHandler = property => event => {
  //   onRequestSort(event, property);
  // };

  return (
    <StandardLayout style={{ minHeight: 500 }}>
      <br />
      <Typography variant="h6" gutterBottom>
        Observations
      </Typography>

      <Grid container>
        <DatePicker label="Start" value={start} onChange={handleStartChange} />
        <DatePicker label="End" value={end} onChange={handleEndChange} />
        <Button onClick={handleLastWeek}>Last week</Button>
        <Button onClick={handleThisWeek}>This week</Button>
        <Button onClick={handleNextWeek}>Next week</Button>
      </Grid>

      {currentPatientObservationLoading && (
        <Grid container alignItems="center" justify="center">
          <DelayComponent wait={100}>
            <CircularProgress />
          </DelayComponent>
        </Grid>
      )}

      <br />
      {!currentPatientObservationLoading && currentPatientObservation && (
        <PatientObservationTableComponent rows={rows} />
      )}
    </StandardLayout>
  );
}

PatientObservationComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PatientObservationComponent);
