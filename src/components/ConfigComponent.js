import React, { Component } from "react";
import { Link } from "react-router-dom";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import StandardLayout from "../layout/StandardLayout";

class ConfigComponent extends Component {
  render() {
    const { fields, handleSubmit } = this.props;

    const style = { maxWidth: 500, margin: "0 auto", padding: 24 };
    const styleButton = { maxWidth: 500, margin: "24px auto" };
    return (
      <StandardLayout>
        <form onSubmit={handleSubmit}>
          <Card style={style}>
            <Typography variant="h5">Config</Typography>

            <Grid container direction="column">
              {fields.map(field => (
                <TextField id={field.key} {...field} margin="normal" />
              ))}
            </Grid>
          </Card>

          <Grid container style={styleButton}>
            <Button component={Link} to="/" fullWidth variant="outlined" color="primary">
              Home
            </Button>
          </Grid>
        </form>
      </StandardLayout>
    );
  }
}

export default ConfigComponent;
