import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import SettingsIcon from "@material-ui/icons/Settings";
import HomeIcon from "@material-ui/icons/Home";
import ExitIcon from "@material-ui/icons/ExitToApp";
import AuthContainer from "../containers/AuthContainer";

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

          <Tooltip title="Home">
            <IconButton component={Link} to="/" color="inherit">
              <HomeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton component={Link} to="/config" color="inherit">
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <AuthContainer
            Layout={({ handleLogout, isAuthenticated }) =>
              isAuthenticated && (
                <Tooltip title="Logout">
                  <IconButton onClick={handleLogout} color="inherit">
                    <ExitIcon />
                  </IconButton>
                </Tooltip>
              )
            }
          />
        </Toolbar>
      </AppBar>
    </div>
  );
}

NavigationComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NavigationComponent);
