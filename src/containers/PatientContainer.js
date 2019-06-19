import React, { Component } from "react";
import { observer } from "mobx-react";

import PatientState from "../state/PatientState";

class PatientContainer extends Component {
  static contextType = PatientState;

  componentDidMount = () => {
    const { loadPatient, patients } = this.context;
    const { patientId } = this.props;

    const alreadyExists = !!patients[patientId];
    if (patientId && !alreadyExists) {
      setTimeout(() => loadPatient(patientId));
    }
  };

  render() {
    const { Layout, patientId, ...rest } = this.props;
    const { patients, patientError, patientLoading } = this.context;

    const currentPatient = patients[patientId];
    const currentPatientError = patientError[patientId];
    const currentPatientLoading = patientLoading[patientId] === undefined ? true : patientLoading[patientId];

    return (
      <Layout
        {...rest}
        patientId={patientId}
        currentPatient={currentPatient}
        currentPatientError={currentPatientError}
        currentPatientLoading={currentPatientLoading}
        {...this.context}
      />
    );
  }
}

export default observer(PatientContainer);
