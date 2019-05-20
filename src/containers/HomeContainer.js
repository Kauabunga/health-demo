import React, { Component } from "react";
import { observer } from "mobx-react";

import PatientState from "../state/PatientState";

class HomeContainer extends Component {
  static contextType = PatientState;

  render() {
    const { Layout } = this.props;
    const {
      patientIds,
      searchPatient,
      isSearchLoading,
      currentSearchResult,
      searchNhi,
      searchBirthdate
    } = this.context;

    return (
      <Layout
        patientIds={patientIds}
        searchNhi={searchNhi}
        currentSearchResult={currentSearchResult}
        isSearchLoading={isSearchLoading}
        searchBirthdate={searchBirthdate}
        searchPatient={searchPatient}
      />
    );
  }
}

export default observer(HomeContainer);
