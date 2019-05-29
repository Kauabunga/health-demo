import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import SettingsIcon from "@material-ui/icons/Settings";
import HomeIcon from "@material-ui/icons/Home";

const styles = {
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1
  }
};

function NavigationComponent(props) {
  const { classes } = props;

  return (
    <div className={classes.root}>
      <AppBar position="static" style={{ boxShadow: "none" }}>
        <Toolbar>
          <Typography component={Link} to="/" variant="h6" color="inherit" style={{ textDecoration: "none" }}>
            PMS DEMO
          </Typography>

          <div className={classes.grow} />

          <IconButton component={Link} to="/" color="inherit">
            <HomeIcon />
          </IconButton>
          <IconButton component={Link} to="/config" color="inherit">
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </div>
  );
}

NavigationComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NavigationComponent);
