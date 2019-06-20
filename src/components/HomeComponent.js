import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import TextField from "@material-ui/core/TextField";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import { red } from "@material-ui/core/colors";

import DelayComponent from "./DelayComponent";
import PatientContainer from "../containers/PatientContainer";
import StandardLayout from "../layout/StandardLayout";

const testIds = [
  { id: "ZRA6853", dob: "1949-07-13" },
  { id: "ZGL5346", dob: "1931-08-18" },
  { id: "ZJP8740", dob: "1924-03-19" },
  { id: "ZCF1582", dob: "1908-03-08" }
];

const testPatients = [{ id: "2143.1" }, { id: "2143.19" }];

const styles = {
  list: {
    margin: "24px 0 48px"
  },
  listItem: {
    height: 96
  }
};

function HomeComponent({
  classes,
  searchNhi,
  isSearchError,
  isSearchLoading,
  currentSearchResult,
  searchBirthdate,
  searchPatient
}) {
  const handleSubmit = e => {
    e.preventDefault();
    searchPatient(searchNhi, searchBirthdate);
  };

  const handleNhiChange = e => {
    searchPatient(e.target.value, searchBirthdate);
  };

  const handleBirthdateChange = e => {
    searchPatient(searchNhi, e.target.value);
  };

  const finishedLoading = currentSearchResult && !isSearchLoading;
  const patientIds = (currentSearchResult && !isSearchLoading && currentSearchResult.patientIds) || [];

  const noPatients = finishedLoading && patientIds.length === 0;

  return (
    <StandardLayout>
      <Typography variant="h6" gutterBottom>
        Welcome
      </Typography>
      <form onSubmit={handleSubmit}>
        <Card style={{ padding: 24, minHeight: "42vh" }}>
          <Grid container wrap="nowrap">
            <Grid container direction="column" style={{ marginRight: 24 }}>
              <Typography variant="subtitle1" gutterBottom>
                Search for a patient
              </Typography>
              <Divider></Divider>
              <br />
              <Grid container>
                <TextField
                  id="nhi"
                  name="nhi"
                  type="text"
                  label="Enter NHI"
                  onChange={handleNhiChange}
                  value={searchNhi}
                />
                <TextField
                  id="birthdate"
                  name="birthdate"
                  label="Birthday"
                  onChange={handleBirthdateChange}
                  type="date"
                  value={searchBirthdate}
                />
              </Grid>
              <div>
                <Button style={{ marginTop: 24, minHeight: 36, minWidth: 120 }} variant="outlined" type="submit">
                  {isSearchLoading ? <CircularProgress size={20} /> : "Search"}
                </Button>
              </div>
            </Grid>

            <Grid container direction="column">
              <Typography variant="subtitle1" gutterBottom>
                Example patient searches
              </Typography>
              <Divider></Divider>
              <List>
                {testIds.map(({ id, dob }) => (
                  <ListItem key={id} button onClick={() => searchPatient(id, dob)}>
                    <Typography>
                      <strong>{id}</strong>&nbsp;&nbsp;&nbsp;&nbsp;{dob}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Typography variant="subtitle1" gutterBottom>
                Test patients
              </Typography>
              <Divider></Divider>
              <List>
                {testPatients.map(({ id }) => (
                  <ListItem key={id} button component={Link} to={`/patient/${id}`}>
                    <PatientContainer
                      key={id}
                      patientId={id}
                      Layout={({ currentPatientError, currentPatient, currentPatientLoading }) => (
                        <Fragment>
                          <ListItemAvatar>
                            {currentPatientLoading ? (
                              <DelayComponent wait={100}>
                                <CircularProgress />
                              </DelayComponent>
                            ) : (
                              (currentPatient && currentPatient.photo && (
                                <Avatar alt={currentPatient.name} src={currentPatient.photo} />
                              )) || <Avatar>{currentPatient && currentPatient.initials}</Avatar>
                            )}
                          </ListItemAvatar>
                          {currentPatient && <ListItemText primary={`${currentPatient.name} (${id})`} />}
                        </Fragment>
                      )}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Card>
      </form>

      {noPatients && (
        <Typography variant="h5" style={{ marginTop: 24 }}>
          No results
        </Typography>
      )}

      {isSearchError && (
        <Typography variant="h5" color="error" style={{ marginTop: 24 }}>
          Error searching
        </Typography>
      )}

      <List className={classes.list}>
        {patientIds.map(id => (
          <PatientContainer
            key={id}
            patientId={id}
            Layout={({ currentPatientError, currentPatient, currentPatientLoading }) => (
              <ListItem button component={Link} to={`/patient/${id}`} className={classes.listItem}>
                <ListItemAvatar>
                  {currentPatientLoading ? (
                    <DelayComponent wait={100}>
                      <CircularProgress />
                    </DelayComponent>
                  ) : (
                    (currentPatient.photo && <Avatar alt={currentPatient.name} src={currentPatient.photo} />) || (
                      <Avatar>{currentPatient.initials}</Avatar>
                    )
                  )}
                </ListItemAvatar>

                {currentPatient && (
                  <ListItemText
                    primary={`${currentPatient.name} (${id})`}
                    secondary={
                      <React.Fragment>
                        <Typography color="textSecondary">{currentPatient.email}</Typography>
                        {currentPatient.address}
                      </React.Fragment>
                    }
                  />
                )}

                {currentPatientError && (
                  <pre style={{ color: red[500] }}>{JSON.stringify(currentPatientError, null, 2)}</pre>
                )}
              </ListItem>
            )}
          />
        ))}
      </List>
    </StandardLayout>
  );
}

HomeComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomeComponent);
