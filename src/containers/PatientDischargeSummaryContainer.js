import React, { Component } from "react";
import { observer } from "mobx-react";

import PatientDischargeSummaryState from "../state/PatientDischargeSummaryState";

class PatientDischargeSummaryContainer extends Component {
  static contextType = PatientDischargeSummaryState;

  render() {
    const { Layout, ...rest } = this.props;
    const { dischargeSummarySubmitting, dischargeSummaryError, createDischargeSummary } = this.context;

    return (
      <Layout
        {...rest}
        dischargeSummarySubmitting={dischargeSummarySubmitting}
        dischargeSummaryError={dischargeSummaryError}
        createDischargeSummary={createDischargeSummary}
      />
    );
  }
}

export default observer(PatientDischargeSummaryContainer);
