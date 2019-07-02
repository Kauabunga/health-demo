import React from "react";
import { decorate, observable, action } from "mobx";
import axios from "axios";

import { credentialsStore } from "./CredentialsState";
import { authStore } from "./AuthState";

class PatientTransferPackState {
  transferPackSubmitting = false;
  transferPackError = null;

  createTransferPack = async transferPack => {
    console.log("createTransferPack", { transferPack });

    this.transferPackSubmitting = true;
    this.transferPackError = null;

    try {
      const result = await createTransferPack(transferPack);
      console.log("Transfer pack Success", result);
    } catch (error) {
      console.log("Error creating transferPack", transferPack, error);

      this.transferPackError = { message: error.message, error: error };
    }

    this.transferPackSubmitting = false;
  };
}

const decorated = decorate(PatientTransferPackState, {
  transferPackSubmitting: observable,
  transferPackError: observable,

  createTransferPack: action
});

export const patientTransferPackStore = new decorated();

export default React.createContext(patientTransferPackStore);

async function createTransferPack(transferPack) {
  console.log("Creating transferPack", transferPack);
  const { client_id, base_uri, base_path_transferpack } = credentialsStore;
  const { session } = authStore;
  const { id_token } = session || {};

  const Authorization = `Bearer ${id_token}`;
  const url = `${base_uri}${base_path_transferpack}`;

  const { currentPatient } = transferPack;
  const { vcareId } = currentPatient;

  try {
    const response = await axios.post(
      url,
      {
        residentId: vcareId,
        reasonForTransfer: "REASON FOR TRANSFER",
        requestedBy: {
          name: "RequestedByName",
          position: "RequestedByPosition"
        },
        routineBloodTestingOrMedicalProcedures: "routineBloodTestingOrMedicalProcedures"
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization,
          apikey: client_id
        }
      }
    );
    const { status, data } = response;

    console.log("TRANFERPACK RESPONSE", status, data);

    if (status !== 201) {
      throw new Error(`Invalid status ${status}`);
    }

    return response;
  } catch (error) {
    console.error("Error creating transferPack", error);
    throw error;
  }
}
