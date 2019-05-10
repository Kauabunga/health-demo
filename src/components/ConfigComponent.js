import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import StandardLayout from "../layout/StandardLayout";

class ConfigComponent extends Component {
  render() {
    const { fields, handleSubmit } = this.props;

    return (
      <StandardLayout>
        <form onSubmit={handleSubmit}>
          <Card style={{ maxWidth: 500, margin: "0 auto", padding: 24 }}>
            <Typography variant="h5">Config</Typography>

            <Grid container direction="column">
              {fields.map(field => (
                <TextField id={field.key} {...field} margin="normal" />
              ))}
            </Grid>
          </Card>
        </form>
      </StandardLayout>
    );
  }
}

export default ConfigComponent;
