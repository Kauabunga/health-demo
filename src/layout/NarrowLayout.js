import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

const styles = {
  root: {
    flexGrow: 1,
    maxWidth: 400,
    margin: "0 auto"
  }
};

function NarrowLayout({ classes, children }) {
  return (
    <Grid container direction="column" className={classes.root}>
      {children}
    </Grid>
  );
}

NarrowLayout.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NarrowLayout);
