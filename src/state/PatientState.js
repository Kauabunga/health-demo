import React from 'react';
import { decorate, observable, action } from 'mobx';
import axios from 'axios';

import { credentialsStore } from './CredentialsState';
import { authStore } from './AuthState';

class PatientState {
  patientIds = ['2143.1'];

  patientLoading = {};
  patientError = {};
  patients = {};

  loadPatient = async patientId => {
    this.patientLoading = { ...this.patientLoading, [patientId]: true };
    this.patientError = { ...this.patientError, [patientId]: null };

    try {
      const { client_id, base_uri, base_path_patient } = credentialsStore;
      const { session } = authStore;
      const { access_token } = session || {};

      const url = `${base_uri}${base_path_patient}/${patientId}`;
      const { status, data } = await axios.get(`https://ryman-healthcare-demo-api.carsonbruce.now.sh/${url}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          apikey: client_id,
        },
      });

      if (status !== 200) {
        throw new Error(`Invalid status ${status}`);
      }

      this.patients = { ...this.patients, [patientId]: data };
    } catch (error) {
      console.log('Error getting patient', patientId, error);
      this.patientError = {
        ...this.patientError,
        [patientId]: {
          message: error.message,
          error: error,
        },
      };
    }

    this.patientLoading = { ...this.patientLoading, [patientId]: false };
  };
}

const decorated = decorate(PatientState, {
  patientIds: observable,
  patientLoading: observable,
  patientError: observable,
  patients: observable,

  loadPatient: action,
});

export const patientStore = new decorated();

export default React.createContext(patientStore);
