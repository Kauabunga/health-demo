import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

const styles = {
  root: {
    flexGrow: 1,
    maxWidth: 1000,
    margin: "0 auto"
  }
};

function StandardLayout({ classes, style, children }) {
  return (
    <Grid container direction="column" className={classes.root} style={style}>
      {children}
    </Grid>
  );
}

StandardLayout.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(StandardLayout);
