import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";

import StandardLayout from "../layout/StandardLayout";
import DelayComponent from "./DelayComponent";

const rootStyles = theme => ({
  columnContainer: {
    flexWrap: "wrap",
    [theme.breakpoints.up("md")]: {
      flexWrap: "nowrap"
    }
  },
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    outline: "none"
  }
});

function PatientCreateDischarge(props) {
  const {
    classes,
    createDischargeSummary,
    dischargeSummarySubmitting,
    dischargeSummaryError,
    patientId,
    currentPatient,
    currentPatientLoading,
    currentPatientError
  } = props;

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setSubmitting] = useState(!!dischargeSummarySubmitting);
  useEffect(() => {
    if (isSubmitting && !dischargeSummarySubmitting && !dischargeSummaryError) {
      setShowModal(true);
    }
    if (dischargeSummarySubmitting !== isSubmitting) {
      setSubmitting(dischargeSummarySubmitting);
    }
  }, [isSubmitting, dischargeSummaryError, dischargeSummarySubmitting]);

  // TEXT
  const [summary, setSummary] = useState("");
  const [pdf, setPdf] = useState({ name: "" });

  const handleSubmit = e => {
    e.preventDefault();

    if (dischargeSummarySubmitting) {
      return;
    }

    const values = {
      summary,
      pdf,
      currentPatient
    };

    createDischargeSummary(values);
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
          Discharge Patient
        </Typography>
        <Divider />
        <br />
        <br />

        {currentPatient && (
          <Grid
            component={Link}
            to={`/patient/${patientId}`}
            container
            direction="row"
            alignItems="center"
            style={{ textDecoration: "none", color: "inherit", marginBottom: 12 }}
          >
            {(currentPatient && currentPatient.photo && (
              <Avatar alt={currentPatient.name} src={currentPatient.photo} />
            )) || <Avatar>{currentPatient.initials}</Avatar>}
            <Typography variant="h6" style={{ marginLeft: 8 }}>
              {currentPatient.name} (Patient {patientId})
            </Typography>
          </Grid>
        )}

        <br />

        <Grid container wrap="wrap">
          <Grid item style={{ flexGrow: 1, minWidth: 400, maxWidth: 500, marginRight: 24 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <TextField
              value={summary}
              onChange={e => setSummary(e.target.value)}
              variant="outlined"
              label="Discharge summary"
              multiline
              rows={4}
              type="textarea"
              fullWidth
            />
          </Grid>

          <br />
          <br />

          <input
            accept="application/pdf,application/vnd.ms-excel"
            className={classes.input}
            style={{ display: "none" }}
            id="raised-button-file"
            multiple
            type="file"
            value={pdf.name}
            onChange={e =>
              setPdf({
                name: e.target.value,
                file: e.target.files[0]
              })
            }
          />
          <label htmlFor="raised-button-file">
            <Button variant="contained" component="span" className={classes.button}>
              {pdf.name ? pdf.name : "Upload pdf"}
            </Button>
          </label>
        </Grid>

        <br />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={dischargeSummarySubmitting}
          style={{ width: 120, marginTop: 12, marginRight: 12 }}
        >
          {dischargeSummarySubmitting ? <CircularProgress size={26} color="inherit" /> : "Submit"}
        </Button>

        <Button
          disabled={dischargeSummarySubmitting}
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

        {dischargeSummaryError && <Typography color="error">{JSON.stringify(dischargeSummaryError)}</Typography>}
        <br />
        <br />
        <br />
        {currentPatientError && (
          <pre style={{ color: red[500], width: "100%", overflowX: "scroll" }}>
            {JSON.stringify(currentPatientError, null, 2)}
          </pre>
        )}
      </form>

      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={showModal}
        onClose={() => setShowModal(false)}
      >
        <div style={getModalStyles()} className={classes.paper}>
          <Typography variant="h6" id="modal-title" gutterBottom>
            Success!
          </Typography>
          <Typography gutterBottom>Your discharge summary has been submitted.</Typography>

          <br />
          <br />
          <Button variant="contained" color="primary" component={Link} to={`/patient/${patientId}`}>
            Back to patient
          </Button>
        </div>
      </Modal>
    </StandardLayout>
  );
}

function getModalStyles() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  };
}

PatientCreateDischarge.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(rootStyles)(PatientCreateDischarge);
