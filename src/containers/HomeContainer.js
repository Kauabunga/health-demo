import React, { Component } from "react";
import { observer } from "mobx-react";

import PatientState from "../state/PatientState";

class HomeContainer extends Component {
  static contextType = PatientState;

  render() {
    const { Layout } = this.props;

    const { patientIds } = this.context;

    return <Layout patientIds={patientIds} />;
  }
}

export default observer(HomeContainer);
