import React, { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { red } from "@material-ui/core/colors";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";

import StandardLayout from "../layout/StandardLayout";
import DelayComponent from "./DelayComponent";
import PatientConditionContainer from "../containers/PatientConditionContainer";

const rootStyles = theme => ({
  columnContainer: {
    flexWrap: "wrap",
    [theme.breakpoints.up("md")]: {
      flexWrap: "nowrap"
    }
  }
});

const useExpansionPanelStyles = makeStyles(theme => ({
  root: {
    boxShadow: "none"
  }
}));
const useExpansionPanelSummaryStyles = makeStyles(theme => ({
  root: {
    padding: 0
  }
}));

const DetailItem = ({ label, value }) => (
  <Grid item>
    <Typography>{label}</Typography>
    <Typography variant="subtitle1" style={{ fontWeight: 700 }} noWrap>
      {value || "unknown"}
    </Typography>
  </Grid>
);

const DetailGroup = ({ label, items, labelProp, value }) => {
  const classesExpansionPanel = useExpansionPanelStyles();
  const classesExpansionPanelSummary = useExpansionPanelSummaryStyles();
  return (
    <Grid item>
      <ExpansionPanel classes={classesExpansionPanel}>
        <ExpansionPanelSummary
          classes={classesExpansionPanelSummary}
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <DetailItem label={label} value={value[labelProp]} />
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container direction="column">
            {items.map(item => (
              <Fragment>
                <DetailItem label={item.label} value={value[item.key]} />
                <Divider style={{ marginTop: 12, marginBottom: 12 }} />
              </Fragment>
            ))}
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </Grid>
  );
};

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

    <DetailItem label="Marital status" value={currentPatient.maritalStatus} />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />

    <DetailItem label="Ethnicity" value={currentPatient.ethnicity} />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />

    <DetailItem label="Care plan" value={currentPatient.carePlan} />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />

    <DetailGroup
      label="Next of kin"
      labelProp="name"
      items={[
        { label: "Phone", key: "phone" },
        { label: "Email", key: "email" },
        { label: "Gender", key: "gender" },
        { label: "Relationship", key: "relationship" }
      ]}
      value={currentPatient.nextOfKin}
    />
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
    <Grid item style={{ flexGrow: 1, flexShrink: 0, maxWidth: 380 }}>
      <Grid container direction="column">
        {(notes || []).map(({ id, text }) => (
          <Card key={id || text} style={{ marginBottom: 12, padding: 12 }}>
            <Typography>{text || "unknown"}</Typography>
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
  const { classes, patientId, currentPatient, currentPatientLoading, currentPatientError } = props;

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
            {currentPatient.name} (Patient {patientId})
          </Typography>

          <div style={{ flexGrow: 1 }}></div>

          <Button
            style={{ marginRight: 12 }}
            color="primary"
            variant="outlined"
            component={Link}
            to={`/patient/${patientId}/notes`}
          >
            Add Consultation Note
          </Button>

          <LongMenu patientId={patientId} />
        </Grid>
      )}

      {currentPatient && (
        <Card style={{ padding: 24 }}>
          <Grid container direction="row" className={classes.columnContainer}>
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

      {currentPatientError && (
        <pre style={{ color: red[500], width: "100%", overflowX: "scroll" }}>
          {JSON.stringify(currentPatientError, null, 2)}
        </pre>
      )}
      <Button component={Link} to="/" variant="outlined" color="primary" style={{ marginTop: 12 }}>
        Back
      </Button>
    </StandardLayout>
  );
}

PatientDetailComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(rootStyles)(PatientDetailComponent);

function LongMenu({ patientId }) {
  const ITEM_HEIGHT = 48;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <div>
      <IconButton aria-label="More" aria-controls="long-menu" aria-haspopup="true" onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: 240
          }
        }}
      >
        <MenuItem component={Link} to={`/patient/${patientId}/transfer-pack`} onClick={handleClose}>
          Create Transfer Pack
        </MenuItem>
        <MenuItem component={Link} to={`/patient/${patientId}/discharge`} onClick={handleClose}>
          Create Discharge Summary
        </MenuItem>
      </Menu>
    </div>
  );
}
