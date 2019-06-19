import React, { Component } from "react";
import { observer } from "mobx-react";

import PatientGpNotesState from "../state/PatientGpNotesState";

class PatientGpNotesContainer extends Component {
  static contextType = PatientGpNotesState;

  render() {
    const { Layout, ...rest } = this.props;
    const { noteSubmitting, noteError, createNote } = this.context;

    return <Layout {...rest} createNote={createNote} noteSubmitting={noteSubmitting} noteError={noteError} />;
  }
}

export default observer(PatientGpNotesContainer);
