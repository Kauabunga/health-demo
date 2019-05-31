import React, { Component } from "react";
import { observer } from "mobx-react";

import PatientConditionState from "../state/PatientConditionState";

class PatientConditionContainer extends Component {
  static contextType = PatientConditionState;

  componentDidMount = () => {
    const { loadPatientCondition, patientConditions } = this.context;
    const { patientId } = this.props;

    const alreadyExists = !!patientConditions[patientId];
    if (patientId && !alreadyExists) {
      loadPatientCondition(patientId);
    }
  };

  render() {
    const { Layout, patientId } = this.props;
    const { loadPatientCondition, patientConditions, patientConditionError, patientConditionLoading } = this.context;

    const currentPatientCondition = patientConditions[patientId];
    const currentPatientConditionError = patientConditionError[patientId];
    const currentPatientConditionLoading =
      patientConditionLoading[patientId] === undefined ? true : patientConditionLoading[patientId];

    return (
      <Layout
        patientId={patientId}
        currentPatientCondition={currentPatientCondition}
        currentPatientConditionError={currentPatientConditionError}
        currentPatientConditionLoading={currentPatientConditionLoading}
        loadPatientCondition={loadPatientCondition}
        {...this.context}
      />
    );
  }
}

export default observer(PatientConditionContainer);
