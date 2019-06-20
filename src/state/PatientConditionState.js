import React from "react";
import { decorate, observable, action } from "mobx";
import axios from "axios";

import { credentialsStore } from "./CredentialsState";
import { authStore } from "./AuthState";

class PatientConditionState {
  patientConditionLoading = {};
  patientConditionError = {};
  patientConditions = {};

  loadPatientCondition = async patientId => {
    console.log("loadPatientCondition", { patientId });

    this.patientConditionLoading = { ...this.patientConditionLoading, [patientId]: true };
    this.patientConditionError = { ...this.patientConditionError, [patientId]: null };

    try {
      const patient = await getPatientCondition(patientId, this.start, this.end);
      this.patientConditions = { ...this.patientConditions, [patientId]: patient };
    } catch (error) {
      console.log("Error getting condition", patientId, error);
      this.patientConditionError = {
        ...this.patientConditionError,
        [patientId]: {
          message: error.message,
          error: error
        }
      };
    }

    this.patientConditionLoading = { ...this.patientConditionLoading, [patientId]: false };
  };
}

const decorated = decorate(PatientConditionState, {
  patientConditionLoading: observable,
  patientConditionError: observable,
  patientConditions: observable,

  loadPatientCondition: action
});

export const patientConditionStore = new decorated();

export default React.createContext(patientConditionStore);

async function getPatientCondition(patientId) {
  const { client_id, base_uri, base_path_patient } = credentialsStore;
  const { session } = authStore;
  const { id_token } = session || {};

  const Authorization = `Bearer ${id_token}`;
  const url = `${base_uri}${base_path_patient}/${patientId}/Condition`;

  try {
    const { status, data } = await axios.get(url, {
      headers: {
        Accept: "application/json",
        Authorization,
        apikey: client_id
      }
    });

    if (status !== 200) {
      throw new Error(`Invalid status ${status}`);
    }

    return transformPatientCondition(data);
  } catch (error) {
    console.error("Error getting condition", patientId, error);
    await wait(getRandomInt(2500, 3000));
    return transformPatientCondition(getDummyPatientCondition());
  }
}

function transformPatientCondition(patientCondition) {
  const { entry } = patientCondition || {};
  const rows = (entry || []).map(({ resource }) => resource);

  const simpleNotes = rows.map(({ text }, index) => {
    const resolvedText = Object.values(text).join("\n");

    return {
      id: index,

      text: resolvedText
    };
  });

  return {
    notes: simpleNotes,
    __original__: patientCondition
  };
}

function getDummyPatientCondition() {
  return {
    resourceType: "Bundle",
    type: "collection",
    total: 6,
    link: [
      {
        relation: "self",
        url: "http://apac-syd-partner02-test.apigee.net/fhir4-0-0/Patient/2143.2/Condition"
      }
    ],
    entry: [
      {
        resource: {
          resourceType: "Condition",
          id: "2736.7",
          text: {
            div: "Alcohol Dependence - Dehydration"
          },
          identifier: [
            {
              use: "secondary",
              system: "http://rymanhealthcare.co.nz",
              value: "2736.7"
            }
          ],
          clinicalStatus: {
            coding: [
              {
                system: "http://hl7.org/fhir/ValueSet/condition-clinical",
                code: "active"
              }
            ]
          },
          verificationStatus: {
            coding: [
              {
                system: "http://hl7.org/fhir/ValueSet/condition-ver-status",
                code: "confirmed"
              }
            ]
          }
        }
      },
      {
        resource: {
          resourceType: "Condition",
          id: "2736.8",
          text: {
            div: "Alzheimer's Dementia - Resident is often found wandering"
          },
          identifier: [
            {
              use: "secondary",
              system: "http://rymanhealthcare.co.nz",
              value: "2736.8"
            }
          ],
          clinicalStatus: {
            coding: [
              {
                system: "http://hl7.org/fhir/ValueSet/condition-clinical",
                code: "active"
              }
            ]
          },
          verificationStatus: {
            coding: [
              {
                system: "http://hl7.org/fhir/ValueSet/condition-ver-status",
                code: "confirmed"
              }
            ]
          }
        }
      },
      {
        resource: {
          resourceType: "Condition",
          id: "2736.9",
          text: {
            div: "Amputation - Missing left leg"
          },
          identifier: [
            {
              use: "secondary",
              system: "http://rymanhealthcare.co.nz",
              value: "2736.9"
            }
          ],
          clinicalStatus: {
            coding: [
              {
                system: "http://hl7.org/fhir/ValueSet/condition-clinical",
                code: "active"
              }
            ]
          },
          verificationStatus: {
            coding: [
              {
                system: "http://hl7.org/fhir/ValueSet/condition-ver-status",
                code: "confirmed"
              }
            ]
          }
        }
      },
      {
        resource: {
          resourceType: "Condition",
          id: "2736.10",
          text: {
            div: "Acute Renal Failure - Who knows? I'm not a nurse!"
          },
          identifier: [
            {
              use: "secondary",
              system: "http://rymanhealthcare.co.nz",
              value: "2736.10"
            }
          ],
          clinicalStatus: {
            coding: [
              {
                system: "http://hl7.org/fhir/ValueSet/condition-clinical",
                code: "active"
              }
            ]
          },
          verificationStatus: {
            coding: [
              {
                system: "http://hl7.org/fhir/ValueSet/condition-ver-status",
                code: "confirmed"
              }
            ]
          }
        }
      },
      {
        resource: {
          resourceType: "Condition",
          id: "2736.11",
          text: {
            div: "Aneamia - Resident faints when standing up."
          },
          identifier: [
            {
              use: "secondary",
              system: "http://rymanhealthcare.co.nz",
              value: "2736.11"
            }
          ],
          clinicalStatus: {
            coding: [
              {
                system: "http://hl7.org/fhir/ValueSet/condition-clinical",
                code: "active"
              }
            ]
          },
          verificationStatus: {
            coding: [
              {
                system: "http://hl7.org/fhir/ValueSet/condition-ver-status",
                code: "confirmed"
              }
            ]
          }
        }
      },
      {
        resource: {
          resourceType: "Condition",
          id: "2736.12",
          text: {
            div: "Other Diagnosis - Alopecia - Resident wears a wig and gets upset if this is removed"
          },
          identifier: [
            {
              use: "secondary",
              system: "http://rymanhealthcare.co.nz",
              value: "2736.12"
            }
          ],
          clinicalStatus: {
            coding: [
              {
                system: "http://hl7.org/fhir/ValueSet/condition-clinical",
                code: "active"
              }
            ]
          },
          verificationStatus: {
            coding: [
              {
                system: "http://hl7.org/fhir/ValueSet/condition-ver-status",
                code: "confirmed"
              }
            ]
          }
        }
      }
    ]
  };
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms || 500));
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
