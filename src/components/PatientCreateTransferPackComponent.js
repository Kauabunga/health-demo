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

function PatientCreateTransferPack(props) {
  const {
    classes,
    createTransferPack,
    transferPackSubmitting,
    transferPackError,
    patientId,
    currentPatient,
    currentPatientLoading,
    currentPatientError
  } = props;

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setSubmitting] = useState(!!transferPackSubmitting);
  useEffect(() => {
    if (isSubmitting && !transferPackSubmitting && !transferPackError) {
      setShowModal(true);
    }
    if (transferPackSubmitting !== isSubmitting) {
      setSubmitting(transferPackSubmitting);
    }
  }, [isSubmitting, transferPackError, transferPackSubmitting]);

  const handleSubmit = e => {
    e.preventDefault();

    if (transferPackSubmitting) {
      return;
    }

    const values = {
      currentPatient
    };

    createTransferPack(values);
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
          Create Transfer Pack
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

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={transferPackSubmitting}
          style={{ width: 120, marginTop: 12, marginRight: 12 }}
        >
          {transferPackSubmitting ? <CircularProgress size={26} color="inherit" /> : "Submit"}
        </Button>

        <Button
          disabled={transferPackSubmitting}
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

        {transferPackError && <Typography color="error">{JSON.stringify(transferPackError)}</Typography>}
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
          <Typography gutterBottom>Your transfer pack has been created.</Typography>

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

PatientCreateTransferPack.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(rootStyles)(PatientCreateTransferPack);
