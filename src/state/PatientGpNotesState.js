import React from "react";
import { decorate, observable, action } from "mobx";
import uuidv5 from "uuid/v5";
import axios from "axios";

import { credentialsStore } from "./CredentialsState";
import { authStore } from "./AuthState";

class PatientGpNotesState {
  noteSubmitting = false;
  noteError = null;

  createNote = async note => {
    console.log("createNote", { note });

    this.noteSubmitting = true;
    this.noteError = null;

    try {
      const result = await createGpNote(note);
      console.log("GP NOTE Success", result);
    } catch (error) {
      console.log("Error creating note", note, error);

      this.noteError = { message: error.message, error: error };
    }

    this.noteSubmitting = false;
  };
}

const decorated = decorate(PatientGpNotesState, {
  noteSubmitting: observable,
  noteError: observable,

  createNote: action
});

export const patientGpNoteStore = new decorated();

export default React.createContext(patientGpNoteStore);

async function createGpNote(note) {
  console.log("Creating note", note);
  const { client_id, base_uri, base_path_composition } = credentialsStore;
  const { session } = authStore;
  const { id_token } = session || {};

  const composition = transformNotes(note);

  const Authorization = `Bearer ${id_token}`;
  const url = `${base_uri}${base_path_composition}`;

  console.log("GP NOTES COMPOSITION", composition);

  try {
    const response = await axios.post(url, composition, {
      headers: {
        Accept: "application/json",
        Authorization,
        apikey: client_id
      }
    });
    const { status, data } = response;

    console.log("GP NOTES RESPONSE", status, data);

    if (status !== 201) {
      throw new Error(`Invalid status ${status}`);
    }

    return response;
  } catch (error) {
    console.error("Error creating gp note", composition, error);
    throw error;
  }
}

/**
 * MEGA FUNCTION
 * MEGA FUNCTION
 * MEGA FUNCTION
 */
export function transformNotes(note, date) {
  const { currentPatient, carePlan, clinicalImpression, medicationRequest, procedure, notes } = note || {};

  const TRANSFORMATION_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

  const renderDiv = content => `<div xmlns="http://www.w3.org/1999/xhtml">${content}</div>`;

  const carePlanResource = carePlan && {
    resourceType: "CarePlan",
    id: uuidv5(carePlan, TRANSFORMATION_NAMESPACE),
    text: {
      div: renderDiv(carePlan)
    }
  };

  const medicationResource = medicationRequest && {
    resourceType: "MedicationRequest",
    id: uuidv5(medicationRequest, TRANSFORMATION_NAMESPACE),
    text: {
      div: renderDiv(medicationRequest)
    }
  };

  const procedureResource = procedure && {
    resourceType: "Procedure",
    id: uuidv5(procedure, TRANSFORMATION_NAMESPACE),
    text: {
      div: renderDiv(procedure)
    }
  };

  const clinicalImpressionResource = clinicalImpression && {
    resourceType: "ClinicalImpression",
    id: uuidv5(clinicalImpression, TRANSFORMATION_NAMESPACE),
    text: {
      div: renderDiv(clinicalImpression)
    }
  };

  const observationResources =
    notes &&
    !!notes.length &&
    notes.map(note => ({
      resourceType: "Observation",
      id: uuidv5(note.text, TRANSFORMATION_NAMESPACE),
      text: {
        div: renderDiv(note.text)
      }
    }));

  const organizationId = uuidv5("Organization", TRANSFORMATION_NAMESPACE);
  const organizationResource = {
    resourceType: "Organization",
    id: organizationId,
    name: "Dr Phil's Practice"
  };

  const practitionerId = uuidv5("Practitioner", TRANSFORMATION_NAMESPACE);
  const practitionerResource = {
    resourceType: "Practitioner",
    id: practitionerId,
    name: [
      {
        given: ["Phil"],
        prefix: ["Dr"]
      }
    ]
  };

  const { birthDate, vcareId, nhi } = currentPatient;

  const patientId = uuidv5("patient", TRANSFORMATION_NAMESPACE);
  const patientResource = {
    resourceType: "Patient",
    id: patientId,
    identifier: [
      {
        use: "secondary",
        system: "http://rymanhealthcare.co.nz",
        value: vcareId
      },
      {
        use: "official",
        system: "http://health.govt.nz/nhi",
        value: nhi
      }
    ],
    birthDate
  };

  const contained = []
    .concat(patientResource)
    .concat(medicationResource)
    .concat(carePlanResource)
    .concat(clinicalImpressionResource)
    .concat(procedureResource)
    .concat(observationResources)
    .concat(organizationResource)
    .concat(practitionerResource)
    .filter(item => !!item);

  const makeCode = code => ({ coding: [{ code }] });
  const sectionCodes = {
    CarePlan: makeCode("18776-5"),
    Procedure: makeCode("29554-3"),
    Observation: makeCode("8716-3"),
    MedicationRequest: makeCode("18776-5"),
    ClinicalImpression: makeCode("51848-0")
  };
  const sectionResourceTypes = ["CarePlan", "Procedure", "Observation", "MedicationRequest", "ClinicalImpression"];
  const containedGroupedByResource = contained
    .filter(({ resourceType }) => sectionResourceTypes.includes(resourceType))
    .reduce(
      (acc, current) => ({ ...acc, [current.resourceType]: [...(acc[current.resourceType] || []), current] }),
      {}
    );

  const section = Object.keys(containedGroupedByResource).map(resourceType => ({
    code: sectionCodes[resourceType],
    entry: containedGroupedByResource[resourceType].map(item => ({ reference: `#${item.id}`, type: resourceType }))
  }));

  return {
    resourceType: "Composition",
    status: "final",
    title: "GP notes",
    date: date || new Date().toISOString(),
    contained,
    section,
    identifier: {
      system: "http://mypractice.co.nz/Notes",
      value: "12345"
    },

    category: [{ coding: [{ code: "11488-4", display: "Consult note" }] }],

    type: {
      coding: [{ code: "75476-2", display: "Physician Note" }]
    },

    subject: {
      reference: `#${patientId}`,
      type: "Patient"
    },

    author: [{ reference: `#${practitionerId}` }],

    custodian: {
      reference: `#${organizationId}`
    }
  };
}

// eslint-disable-next-line
function getDummyGPNotesSubmitComposition() {
  return {
    resourceType: "Composition",
    contained: [
      {
        resourceType: "CarePlan",
        id: "60461e26-3cc9-4926-80fa-ced6879b44d9",
        text: {}
      },
      {
        resourceType: "MedicationRequest",
        id: "a4120ec3-e3fa-4a25-9e61-3e1d2af753b0",
        text: {
          div: '<div xmlns="http://www.w3.org/1999/xhtml">Give her some medication</div>'
        }
      },
      {
        resourceType: "Procedure",
        id: "4d1e4def-adf8-4005-866b-af789507c5db",
        text: {
          div: '<div xmlns="http://www.w3.org/1999/xhtml">Administer medication and observe</div>'
        }
      },
      {
        resourceType: "Observation",
        id: "ef9a187a-f5f7-44b7-abe6-fda5fe0d20a5",
        text: {
          div: '<div xmlns="http://www.w3.org/1999/xhtml">Coughs loudly</div>'
        }
      },
      {
        resourceType: "Observation",
        id: "7e248869-0eb4-4920-9c9e-960a8e7e7830",
        text: {
          div: '<div xmlns="http://www.w3.org/1999/xhtml">Sore chest</div>'
        }
      },
      {
        resourceType: "Condition",
        id: "f87f6532-b9de-4349-af16-cdb2d9982d5d",
        text: {
          div: '<div xmlns="http://www.w3.org/1999/xhtml">Diabetes</div>'
        }
      },
      {
        resourceType: "Condition",
        id: "a83ff0eb-0323-42d9-a6e3-7aa9d573e090",
        text: {
          div: '<div xmlns="http://www.w3.org/1999/xhtml">Rabies</div>'
        }
      },
      {
        resourceType: "ClinicalImpression",
        id: "0e45c1c7-8b74-469a-91b1-760ff6707829",
        text: {
          div: '<div xmlns="http://www.w3.org/1999/xhtml">We are clinically impressed!</div>'
        }
      },
      {
        resourceType: "Patient",
        id: "add8e052-d291-45a4-ade7-5c92fe0a6c25",
        identifier: [
          {
            use: "secondary",
            system: "http://rymanhealthcare.co.nz",
            value: "2143.5"
          },
          {
            use: "official",
            system: "http://health.govt.nz/nhi",
            value: "ZGD5674"
          }
        ],
        birthDate: "1912-11-10"
      },
      {
        resourceType: "Organization",
        id: "8e6eb900-9ce7-4d1a-af10-1955257a57f9",
        name: "Dr Phil's Practice"
      },
      {
        resourceType: "Practitioner",
        id: "635180ed-7ad3-4672-bb24-4a600e14e432",
        name: [
          {
            given: ["Phil"],
            prefix: ["Dr"]
          }
        ]
      }
    ],
    identifier: {
      system: "http://mypractice.co.nz/Notes",
      value: "12345"
    },
    status: "final",
    type: {
      coding: [
        {
          code: "75476-2",
          display: "Physician Note"
        }
      ]
    },
    category: [
      {
        coding: [
          {
            code: "11488-4",
            display: "Consult note"
          }
        ]
      }
    ],
    subject: {
      reference: "#add8e052-d291-45a4-ade7-5c92fe0a6c25",
      type: "Patient"
    },
    date: "2019-05-30T12:00:00Z",
    author: [
      {
        reference: "#635180ed-7ad3-4672-bb24-4a600e14e432"
      }
    ],
    title: "GP notes",
    custodian: {
      reference: "#8e6eb900-9ce7-4d1a-af10-1955257a57f9"
    },
    section: [
      {
        code: {
          coding: [
            {
              code: "29545-1"
            }
          ]
        },
        entry: [
          {
            reference: "#0e45c1c7-8b74-469a-91b1-760ff6707829",
            type: "ClinicalImpression"
          }
        ]
      },
      {
        code: {
          coding: [
            {
              code: "51848-0"
            }
          ]
        },
        entry: [
          {
            reference: "#f87f6532-b9de-4349-af16-cdb2d9982d5d",
            type: "Condition"
          },
          {
            reference: "#a83ff0eb-0323-42d9-a6e3-7aa9d573e090",
            type: "Condition"
          }
        ]
      },
      {
        code: {
          coding: [
            {
              code: "29554-3"
            }
          ]
        },
        entry: [
          {
            reference: "#4d1e4def-adf8-4005-866b-af789507c5db",
            type: "Procedure"
          }
        ]
      },
      {
        code: {
          coding: [
            {
              code: "18776-5"
            }
          ]
        },
        entry: [
          {
            reference: "#60461e26-3cc9-4926-80fa-ced6879b44d9",
            type: "CarePlan"
          }
        ]
      },
      {
        code: {
          coding: [
            {
              code: "8716-3"
            }
          ]
        },
        entry: [
          {
            reference: "#ef9a187a-f5f7-44b7-abe6-fda5fe0d20a5",
            type: "Observation"
          },
          {
            reference: "#7e248869-0eb4-4920-9c9e-960a8e7e7830",
            type: "Observation"
          }
        ]
      },
      {
        code: {
          coding: [
            {
              code: "18776-5"
            }
          ]
        },
        entry: [
          {
            reference: "#a4120ec3-e3fa-4a25-9e61-3e1d2af753b0",
            type: "MedicationRequest"
          }
        ]
      }
    ]
  };
}
