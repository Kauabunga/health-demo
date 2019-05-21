import React, { Component } from "react";
import { observer } from "mobx-react";

import PatientObservationState from "../state/PatientObservationState";

class PatientObservationContainer extends Component {
  static contextType = PatientObservationState;

  componentDidMount = () => {
    const { loadPatientObservation, patientObservations } = this.context;
    const { patientId } = this.props;

    const alreadyExists = !!patientObservations[patientId];
    if (patientId && !alreadyExists) {
      loadPatientObservation(patientId);
    }
  };

  render() {
    const { Layout, patientId } = this.props;
    const {
      loadPatientObservation,
      patientObservations,
      patientObservationError,
      patientObservationLoading
    } = this.context;

    const currentPatientObservation = patientObservations[patientId];
    const currentPatientObservationError = patientObservationError[patientId];
    const currentPatientObservationLoading =
      patientObservationLoading[patientId] === undefined ? true : patientObservationLoading[patientId];

    return (
      <Layout
        patientId={patientId}
        currentPatientObservation={currentPatientObservation}
        currentPatientObservationError={currentPatientObservationError}
        currentPatientObservationLoading={currentPatientObservationLoading}
        loadPatientObservation={loadPatientObservation}
        {...this.context}
      />
    );
  }
}

export default observer(PatientObservationContainer);
