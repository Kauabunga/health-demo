import React, { Component } from "react";
import { observer } from "mobx-react";

import PatientTransferPackState from "../state/PatientTransferPackState";

class PatientTransferPackContainer extends Component {
  static contextType = PatientTransferPackState;

  render() {
    const { Layout, ...rest } = this.props;
    const { transferPackSubmitting, transferPackError, createTransferPack } = this.context;

    return (
      <Layout
        {...rest}
        transferPackSubmitting={transferPackSubmitting}
        transferPackError={transferPackError}
        createTransferPack={createTransferPack}
      />
    );
  }
}

export default observer(PatientTransferPackContainer);
