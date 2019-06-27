import React, { Component } from "react";
import CredentialsState from "../state/CredentialsState";
import { observer } from "mobx-react";

class ConfigContainer extends Component {
  static contextType = CredentialsState;

  handleSubmit = event => {
    event.preventDefault();
  };

  render() {
    const { Layout } = this.props;
    const {
      client_id,
      client_secret,

      base_uri,
      base_path_oauth,
      base_path_patient,
      base_path_observation,
      base_path_composition,
      base_path_transferpack,

      handleBaseUriChange,
      handleBasePathOAuthChange,
      handleBasePathPatientChange,
      handleBasePathObservationChange,
      handleBasePathCompositionChange,
      handleBasePathTransferPackChange,

      handleClientIdChange,
      handleClientSecretChange,

      errorsObservation,
      handleErrorsObservationChange,

      errorsPatient,
      handleErrorsPatientChange,

      errorsCondition,
      handleErrorsConditionChange
    } = this.context;

    const fields = [
      { label: "Base URI", key: "base_uri", onChange: handleBaseUriChange, value: base_uri },
      { label: "Base OAuth Path", key: "base_path_oauth", onChange: handleBasePathOAuthChange, value: base_path_oauth },
      {
        label: "Base Patient Path",
        key: "base_path_patient",
        onChange: handleBasePathPatientChange,
        value: base_path_patient
      },
      {
        label: "Base Observation Path",
        key: "base_path_observation",
        onChange: handleBasePathObservationChange,
        value: base_path_observation
      },
      {
        label: "Base Composition Path",
        key: "base_path_composition",
        onChange: handleBasePathCompositionChange,
        value: base_path_composition
      },
      {
        label: "Base Transfer Pack Path",
        key: "base_path_transferpack",
        onChange: handleBasePathTransferPackChange,
        value: base_path_transferpack
      },
      { label: "Client Id", key: "client_id", onChange: handleClientIdChange, value: client_id },
      { label: "Client Secret", key: "client_secret", onChange: handleClientSecretChange, value: client_secret },

      {
        type: "checkbox",
        label: "Enable errors /Observable",
        key: "errorsObservation",
        onChange: handleErrorsObservationChange,
        checked: !!errorsObservation
      },
      {
        type: "checkbox",
        label: "Enable errors /Patient",
        key: "errorsPatient",
        onChange: handleErrorsPatientChange,
        checked: !!errorsPatient
      },
      {
        type: "checkbox",
        label: "Enable errors /Condition",
        key: "errorsCondition",
        onChange: handleErrorsConditionChange,
        checked: !!errorsCondition
      }
    ];

    return <Layout handleSubmit={this.handleSubmit} fields={fields} />;
  }
}

export default observer(ConfigContainer);
