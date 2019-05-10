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
  },
  config: {
    marginTop: 12
  }
};

function LoginComponent(props) {
  const { classes, handleLogin, errorMessage, authenticating } = props;

  return (
    <NarrowLayout>
      <Typography variant="title">Authenticate with client credentials</Typography>

      <Button onClick={handleLogin} className={classes.login} variant="contained" color="primary">
        Login
        {authenticating && <CircularProgress size={24} className={classes.buttonProgress} />}
      </Button>

      <Typography color="error">{errorMessage}&nbsp;</Typography>

      <Button component={Link} to="/config" className={classes.config} variant="outlined" color="primary">
        Config
      </Button>
    </NarrowLayout>
  );
}

LoginComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(LoginComponent);
