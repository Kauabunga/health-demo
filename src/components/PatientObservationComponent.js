import React from "react";
import PropTypes from "prop-types";
import { subDays, addDays } from "date-fns";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { DatePicker } from "@material-ui/pickers";

import StandardLayout from "../layout/StandardLayout";
import DelayComponent from "./DelayComponent";

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
    classes,
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

  return (
    <StandardLayout>
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
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell align="right">Issued date</TableCell>
                <TableCell align="right">Categories</TableCell>
                <TableCell align="right">Interpretations</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    {row.code}
                  </TableCell>
                  <TableCell align="right">{row.value}</TableCell>
                  <TableCell align="right">{row.issued}</TableCell>
                  <TableCell align="right">{row.categories}</TableCell>
                  <TableCell align="right">{row.interpretations}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </StandardLayout>
  );
}

PatientObservationComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PatientObservationComponent);
