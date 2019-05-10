import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Typography } from "@material-ui/core";
import NarrowLayout from "../layout/NarrowLayout";

const styles = {
  root: {
    flexGrow: 1
  },
  login: {
    marginTop: 24
  }
};

function LoginComponent(props) {
  const { classes, handleLogin, authenticating } = props;

  return (
    <NarrowLayout>
      <Typography variant="title">Authenticate with client credentials</Typography>

      <Button onClick={handleLogin} className={classes.login} variant="contained" color="primary">
        Login
        {authenticating && <CircularProgress size={24} className={classes.buttonProgress} />}
      </Button>

      <Button component={Link} to="/config" className={classes.login} variant="outlined" color="primary">
        Config
      </Button>
    </NarrowLayout>
  );
}

LoginComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(LoginComponent);
