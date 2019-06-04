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
    currentPatientObservationLoading,
    currentPatientObservationError
  } = props;

  if (!currentPatientObservation) {
    return null;
  }

  const { rows } = currentPatientObservation || { rows: [] };

  const today = new Date().toISOString();
  const handleStartChange = date => loadPatientObservation(patientId, date.toISOString(), end);
  const handleEndChange = date => loadPatientObservation(patientId, start, date.toISOString());
  const handleYesterday = () => loadPatientObservation(patientId, subDays(new Date(), 1).toISOString(), today);
  const handleToday = () => loadPatientObservation(patientId, today, addDays(new Date(), 1).toISOString());

  // const createSortHandler = property => event => {
  //   onRequestSort(event, property);
  // };

  const showTable =
    !currentPatientObservationLoading &&
    currentPatientObservation &&
    !currentPatientObservationError &&
    rows &&
    !!rows.length;

  const noItems = !currentPatientObservationError && !currentPatientObservationLoading && rows && !rows.length;

  return (
    <StandardLayout style={{ minHeight: 500 }}>
      <br />
      <Typography variant="h6" gutterBottom>
        Observations
      </Typography>

      <Grid container>
        <DatePicker autoOk label="Start" value={start} onChange={handleStartChange} />
        <DatePicker autoOk label="End" value={end} onChange={handleEndChange} />
        <Button onClick={handleYesterday}>Yesterday</Button>
        <Button onClick={handleToday}>Today</Button>
      </Grid>

      {currentPatientObservationError && (
        <Typography variant="h6" color="error" style={{ marginTop: 24 }}>
          {currentPatientObservationError.message}
        </Typography>
      )}

      {currentPatientObservationLoading && (
        <Grid container alignItems="center" justify="center">
          <DelayComponent wait={100}>
            <CircularProgress />
          </DelayComponent>
        </Grid>
      )}

      <br />
      {showTable && <PatientObservationTableComponent rows={rows} />}
      {noItems && <Typography style={{ marginTop: 24 }}>There are no results in this date range</Typography>}
    </StandardLayout>
  );
}

PatientObservationComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PatientObservationComponent);
