import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import TextField from "@material-ui/core/TextField";
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
import AuthState from "../state/AuthState";
import PatientContainer from "../containers/PatientContainer";
import StandardLayout from "../layout/StandardLayout";

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
  patientIds,
  searchNhi,
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

  return (
    <StandardLayout>
      <Typography variant="h6" gutterBottom>
        Welcome
      </Typography>
      <form onSubmit={handleSubmit}>
        <Card style={{ padding: 24 }}>
          <Typography variant="subtitle1" gutterBottom>
            Lookup a user
          </Typography>
          <Grid container>
            <TextField id="nhi" name="nhi" type="text" label="Enter NHI" onChange={handleNhiChange} value={searchNhi} />
            <TextField
              id="birthdate"
              name="birthdate"
              label="Birthday"
              onChange={handleBirthdateChange}
              type="date"
              value={searchBirthdate}
            />

            <Button style={{ marginLeft: 20 }} variant="outlined" type="submit">
              {isSearchLoading ? <CircularProgress /> : "Search"}
            </Button>
          </Grid>
        </Card>
      </form>

      <List className={classes.list}>
        {currentSearchResult &&
          !isSearchLoading &&
          currentSearchResult.patientIds.map(id => (
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
                      <Avatar alt={currentPatient.name} src={currentPatient.photo} />
                    )}
                  </ListItemAvatar>

                  {currentPatient && (
                    <ListItemText
                      primary={`${currentPatient.name} (${id})`}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" className={classes.inline} color="textPrimary">
                            {currentPatient.email}
                          </Typography>
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

      <div>
        <AuthState.Consumer>
          {({ handleLogout }) => (
            <Button onClick={handleLogout} color="secondary" variant="outlined">
              Logout
            </Button>
          )}
        </AuthState.Consumer>
      </div>
    </StandardLayout>
  );
}

HomeComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomeComponent);
