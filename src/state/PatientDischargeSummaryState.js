import React from "react";
import { decorate, observable, action } from "mobx";
import uuidv5 from "uuid/v5";
import axios from "axios";
import { format } from "date-fns";

import { credentialsStore } from "./CredentialsState";
import { authStore } from "./AuthState";

class PatientDischargeSummaryState {
  dischargeSummarySubmitting = false;
  dischargeSummaryError = null;

  createDischargeSummary = async dischargeSummary => {
    console.log("create dischargeSummary", { dischargeSummary });

    this.dischargeSummarySubmitting = true;
    this.dischargeSummaryError = null;

    try {
      const result = await createDischargeSummary(dischargeSummary);
      console.log("dischargeSummary Success", result);
    } catch (error) {
      console.log("Error creating dischargeSummary", dischargeSummary, error);

      this.dischargeSummaryError = { message: error.message, error: error };
    }

    this.dischargeSummarySubmitting = false;
  };
}

const decorated = decorate(PatientDischargeSummaryState, {
  dischargeSummarySubmitting: observable,
  dischargeSummaryError: observable,

  createDischargeSummary: action
});

export const patientDischargeSummaryStore = new decorated();

export default React.createContext(patientDischargeSummaryStore);

async function createDischargeSummary(dischargeSummary) {
  const { client_id, base_uri, base_path_composition } = credentialsStore;
  const { session } = authStore;
  const { id_token } = session || {};

  const Authorization = `Bearer ${id_token}`;
  const url = `${base_uri}${base_path_composition}`;

  try {
    const composition = await transformSummary(dischargeSummary);

    console.log("Creating dischargeSummary", composition, dischargeSummary);

    const response = await axios.post(url, composition, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization,
        apikey: client_id
      }
    });
    const { status, data } = response;

    console.log("dischargeSummary RESPONSE", status, data);

    if (status !== 201) {
      throw new Error(`Invalid status ${status}`);
    }

    return response;
  } catch (error) {
    console.error("Error creating dischargeSummary", error);
    throw error;
  }
}

/**
 * MEGA FUNCTION
 * MEGA FUNCTION
 * MEGA FUNCTION
 *
 *
 */
export async function transformSummary(summary, date) {
  const { currentPatient, pdf, summary: summaryText } = summary || {};

  const d = format(new Date(), "yyyy-MM-dd", { awareOfUnicodeTokens: false });
  const time = format(new Date(), "HH:mm:ss+12:00", { awareOfUnicodeTokens: false });

  const TRANSFORMATION_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

  const renderDiv = content => `<div xmlns="http://www.w3.org/1999/xhtml">${content}</div>`;

  const { file } = pdf || {};

  const reader = new FileReader();

  const base64file = await new Promise((resolve, reject) => {
    reader.onload = e => {
      const binaryData = e.target.result;
      const base64String = window.btoa(binaryData);
      return resolve(base64String);
    };
    reader.onerror = error => reject(error);
    reader.readAsBinaryString(file);
  });

  const y = base64file[base64file.length - 2] === "=" ? 2 : 1;
  const base64length = base64file.length * (3 / 4) - y;

  const summaryResource = summaryText && {
    resourceType: "DocumentReference",
    id: uuidv5(summaryText, TRANSFORMATION_NAMESPACE),
    text: {
      div: renderDiv(summaryText)
    },
    status: "current",
    docStatus: "final",
    content: [
      {
        attachment: {
          contentType: "application/pdf",
          data: base64file,
          size: base64length,
          title: "Scanned Discharge Summary",
          // creation: date || new Date().toISOString()
          creation: date || `${d}T${time}`
        },
        format: {
          system: "http://ihe.net/fhir/ValueSet/IHE.FormatCode.codesystem",
          code: "urn:ihe:iti:xds-sd:pdf:2008"
        }
      }
    ],
    type: {
      coding: [
        {
          system: "http://hl7.org/fhir/ValueSet/c80-doc-typecodes",
          code: "18842-5"
        }
      ]
    },
    category: [
      {
        coding: [
          {
            system: "http://hl7.org/fhir/ValueSet/document-classcodes",
            code: "18842-5"
          }
        ]
      }
    ]
  };

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
    .concat(summaryResource)
    .concat(organizationResource)
    .concat(practitionerResource)
    .filter(item => !!item);

  const makeCode = code => ({ coding: [{ code }] });
  const sectionCodes = {
    DocumentReference: makeCode("11535-2")
  };

  const sectionResourceTypes = ["DocumentReference"];
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
    title: "Discharge summary",
    // date: date || new Date().toISOString(),
    date: date || `${d}T${time}`,
    contained,
    section,
    identifier: {
      system: "http://cdhb.health.nz/DischargeSummary",
      value: "12345"
    },
    type: { coding: [{ code: "18842-5", display: "Discharge summary" }] },
    category: [{ coding: [{ code: "18842-5", display: "Discharge summary" }] }],

    subject: {
      reference: `#${patientId}`,
      type: "Patient"
    },

    author: [
      {
        reference: `#${practitionerId}`,
        type: "Practitioner"
      }
    ],

    custodian: {
      reference: `#${organizationId}`
    }
  };
}

// eslint-disable-next-line
function getExample() {
  return {
    resourceType: "Composition",
    contained: [
      {
        resourceType: "DocumentReference",
        id: "3826d570-9749-4824-a66e-54448015dcea",
        text: {
          div:
            '<div xmlns="http://www.w3.org/1999/xhtml">Today we discharged Mr Doo from the hospital in fine health and good spirits. We do worry about his excessive hunger and obsession with food. Suggest some counselling.</div>'
        },
        status: "current",
        docStatus: "final",
        type: {
          coding: [
            {
              system: "http://hl7.org/fhir/ValueSet/c80-doc-typecodes",
              code: "18842-5"
            }
          ]
        },
        category: [
          {
            coding: [
              {
                system: "http://hl7.org/fhir/ValueSet/document-classcodes",
                code: "18842-5"
              }
            ]
          }
        ],
        date: "2019-07-03T16:14:24.3713068+12:00",
        content: [
          {
            attachment: {
              contentType: "application/pdf",
              data:
                "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",
              size: 6176,
              title: "Scanned Discharge Summary",
              creation: "2019-06-26T16:14:24.3742527+12:00"
            },
            format: {
              system: "http://ihe.net/fhir/ValueSet/IHE.FormatCode.codesystem",
              code: "urn:ihe:iti:xds-sd:pdf:2008"
            }
          }
        ]
      },
      {
        resourceType: "Patient",
        id: "c6a2e382-7bc2-40bc-bce8-0c4167235a33",
        identifier: [
          {
            use: "secondary",
            system: "http://rymanhealthcare.co.nz",
            value: "2143.1"
          }
        ],
        name: [
          {
            family: "Doo",
            given: ["Scooby"]
          }
        ],
        birthDate: "1912-11-10"
      },
      {
        resourceType: "Organization",
        id: "01c14fd9-e581-4251-89d7-9fd8a2c05d58",
        name: "Canterbury District Health Board"
      },
      {
        resourceType: "Practitioner",
        id: "ad409871-5e51-42d8-bce1-4e83b77d5633",
        name: [
          {
            given: ["Phil"],
            prefix: ["Dr"]
          }
        ]
      }
    ],
    identifier: {
      system: "http://cdhb.health.nz/DischargeSummary",
      value: "12345"
    },
    status: "final",
    type: {
      coding: [
        {
          code: "18842-5",
          display: "Discharge summary"
        }
      ]
    },
    category: [
      {
        coding: [
          {
            code: "18842-5",
            display: "Discharge summary"
          }
        ]
      }
    ],
    subject: {
      reference: "#c6a2e382-7bc2-40bc-bce8-0c4167235a33",
      type: "Patient"
    },
    date: "2019-07-03T16:19:00Z",
    author: [
      {
        reference: "#ad409871-5e51-42d8-bce1-4e83b77d5633",
        type: "Practitioner"
      }
    ],
    title: "Discharge Summary for Scooby Doo",
    custodian: {
      reference: "#01c14fd9-e581-4251-89d7-9fd8a2c05d58",
      type: "Organization"
    },
    section: [
      {
        code: {
          coding: [
            {
              code: "11535-2"
            }
          ]
        },
        entry: [
          {
            reference: "#3826d570-9749-4824-a66e-54448015dcea",
            type: "DocumentReference"
          }
        ]
      }
    ]
  };
}
