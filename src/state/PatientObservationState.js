import React from "react";
import { decorate, observable, action } from "mobx";
import axios from "axios";
import qs from "qs";

import { credentialsStore } from "./CredentialsState";
import { authStore } from "./AuthState";

class PatientObservationState {
  patientObservationLoading = {};
  patientObservationError = {};
  patientObservations = {};

  start = new Date().toISOString();
  end = new Date().toISOString();

  loadPatientObservation = async (patientId, start, end) => {
    console.log("loadPatientObservation", { patientId, start, end });
    if (start) {
      this.start = start;
    }
    if (end) {
      this.end = end;
    }

    this.patientObservationLoading = { ...this.patientObservationLoading, [patientId]: true };
    this.patientObservationError = { ...this.patientObservationError, [patientId]: null };

    try {
      const patient = await getPatientObservation(patientId, this.start, this.end);
      this.patientObservations = { ...this.patientObservations, [patientId]: patient };
    } catch (error) {
      console.log("Error getting patient", patientId, error);
      this.patientObservationError = {
        ...this.patientObservationError,
        [patientId]: {
          message: error.message,
          error: error
        }
      };
    }

    this.patientObservationLoading = { ...this.patientObservationLoading, [patientId]: false };
  };
}

const decorated = decorate(PatientObservationState, {
  patientObservationLoading: observable,
  patientObservationError: observable,
  patientObservations: observable,

  loadPatientObservation: action,

  start: observable,
  end: observable
});

export const patientObservationStore = new decorated();

export default React.createContext(patientObservationStore);

async function getPatientObservation(patientId, start, end) {
  const { client_id, base_uri, base_path_observation } = credentialsStore;
  const { session } = authStore;
  const { id_token } = session || {};

  const Authorization = `Bearer ${id_token}`;
  const url = `${base_uri}${base_path_observation}?${qs.stringify({
    "subject.patient._id": patientId,
    "effective.period.start": start.substring(0, "XXXX-XX-XX".length),
    "effective.period.end": end.substring(0, "XXXX-XX-XX".length)
  })}`;

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

    return transformPatientObservation(data);
  } catch (error) {
    console.error("Error getting observation", patientId, error);
    await wait(getRandomInt(2500, 3000));
    return transformPatientObservation(getDummyPatientObservation());
  }
}

function transformPatientObservation(patientObservation) {
  const { entry } = patientObservation || {};
  const rows = (entry || []).map(({ resource }) => resource);

  const simpleRows = rows.map(({ category, code, issued, valueString, interpretation }, index) => {
    const categories = (category || []).map(({ text }) => text).join(", ");
    const interpretations = (interpretation || []).map(({ text }) => text).join(", ");

    return {
      id: index,
      code: code && code.text,
      categories,
      interpretations,
      issued,
      value: valueString
    };
  });

  return {
    rows: simpleRows,
    __original__: patientObservation
  };
}

function getDummyPatientObservation() {
  return {
    resourceType: "Bundle",
    type: "searchset",
    total: 25,
    link: [
      {
        relation: "self",
        url:
          "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation?subject.patient._id=2143.19&effective.period.start=2019-05-01&effective.period.end=2019-05-16"
      }
    ],
    entry: [
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "TEMP",
                display: "Temp"
              }
            ],
            text: "Temp: TEMP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-09T16:15:34+12:00",
          valueString: "36.60 oC",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "Low",
                  display: "Low"
                }
              ],
              text: "Low"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "OXYGEN",
                display: "O2 Sats"
              }
            ],
            text: "O2 Sats: OXYGEN"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-09T16:15:34+12:00",
          valueString: "97 SpO2%",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "No Levels",
                  display: "No Levels"
                }
              ],
              text: "No Levels"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "BP",
                display: "BP"
              }
            ],
            text: "BP: BP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-09T16:15:34+12:00",
          valueString: "70/80 mmHg",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "",
                  display: ""
                }
              ],
              text: ""
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "P",
                display: "Pulse"
              }
            ],
            text: "Pulse: P"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-09T16:15:34+12:00",
          valueString: "77 BPM",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "Normal",
                  display: "Normal"
                }
              ],
              text: "Normal"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "RESP",
                display: "Resp"
              }
            ],
            text: "Resp: RESP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-09T16:15:34+12:00",
          valueString: "20 RPM",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "High",
                  display: "High"
                }
              ],
              text: "High"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "TEMP",
                display: "Temp"
              }
            ],
            text: "Temp: TEMP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-12T16:15:06+12:00",
          valueString: "36.60 oC",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "Low",
                  display: "Low"
                }
              ],
              text: "Low"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "OXYGEN",
                display: "O2 Sats"
              }
            ],
            text: "O2 Sats: OXYGEN"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-12T16:15:06+12:00",
          valueString: "99 SpO2%",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "No Levels",
                  display: "No Levels"
                }
              ],
              text: "No Levels"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "BP",
                display: "BP"
              }
            ],
            text: "BP: BP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-12T16:15:06+12:00",
          valueString: "100/70 mmHg",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "",
                  display: ""
                }
              ],
              text: ""
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "P",
                display: "Pulse"
              }
            ],
            text: "Pulse: P"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-12T16:15:06+12:00",
          valueString: "70 BPM",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "Normal",
                  display: "Normal"
                }
              ],
              text: "Normal"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "RESP",
                display: "Resp"
              }
            ],
            text: "Resp: RESP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-12T16:15:06+12:00",
          valueString: "18 RPM",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "Normal",
                  display: "Normal"
                }
              ],
              text: "Normal"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "TEMP",
                display: "Temp"
              }
            ],
            text: "Temp: TEMP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-14T16:16:06+12:00",
          valueString: "37 oC",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "Normal",
                  display: "Normal"
                }
              ],
              text: "Normal"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "OXYGEN",
                display: "O2 Sats"
              }
            ],
            text: "O2 Sats: OXYGEN"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-14T16:16:06+12:00",
          valueString: "98 SpO2%",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "No Levels",
                  display: "No Levels"
                }
              ],
              text: "No Levels"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "BP",
                display: "BP"
              }
            ],
            text: "BP: BP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-14T16:16:06+12:00",
          valueString: "100/99 mmHg",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "",
                  display: ""
                }
              ],
              text: ""
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "P",
                display: "Pulse"
              }
            ],
            text: "Pulse: P"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-14T16:16:06+12:00",
          valueString: "120 BPM",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "High",
                  display: "High"
                }
              ],
              text: "High"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "RESP",
                display: "Resp"
              }
            ],
            text: "Resp: RESP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-14T16:16:06+12:00",
          valueString: "21 RPM",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "High",
                  display: "High"
                }
              ],
              text: "High"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "TEMP",
                display: "Temp"
              }
            ],
            text: "Temp: TEMP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-15T16:04:13+12:00",
          valueString: "36.60 oC",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "Low",
                  display: "Low"
                }
              ],
              text: "Low"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "OXYGEN",
                display: "O2 Sats"
              }
            ],
            text: "O2 Sats: OXYGEN"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-15T16:04:13+12:00",
          valueString: "97 SpO2%",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "No Levels",
                  display: "No Levels"
                }
              ],
              text: "No Levels"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "BP",
                display: "BP"
              }
            ],
            text: "BP: BP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-15T16:04:13+12:00",
          valueString: "110/90 mmHg",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "",
                  display: ""
                }
              ],
              text: ""
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "P",
                display: "Pulse"
              }
            ],
            text: "Pulse: P"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-15T16:04:13+12:00",
          valueString: "66 BPM",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "Normal",
                  display: "Normal"
                }
              ],
              text: "Normal"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "RESP",
                display: "Resp"
              }
            ],
            text: "Resp: RESP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-15T16:04:13+12:00",
          valueString: "21 RPM",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "High",
                  display: "High"
                }
              ],
              text: "High"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "TEMP",
                display: "Temp"
              }
            ],
            text: "Temp: TEMP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-15T16:17:31+12:00",
          valueString: "37 oC",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "Normal",
                  display: "Normal"
                }
              ],
              text: "Normal"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "OXYGEN",
                display: "O2 Sats"
              }
            ],
            text: "O2 Sats: OXYGEN"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-15T16:17:31+12:00",
          valueString: "96 SpO2%",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "No Levels",
                  display: "No Levels"
                }
              ],
              text: "No Levels"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "BP",
                display: "BP"
              }
            ],
            text: "BP: BP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-15T16:17:31+12:00",
          valueString: "99/77 mmHg",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "",
                  display: ""
                }
              ],
              text: ""
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "P",
                display: "Pulse"
              }
            ],
            text: "Pulse: P"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-15T16:17:31+12:00",
          valueString: "140 BPM",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "High",
                  display: "High"
                }
              ],
              text: "High"
            }
          ]
        },
        search: {
          mode: "match"
        }
      },
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Observation/XYZ",
        resource: {
          resourceType: "Observation",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://hl7.org/fhir/StructureDefinition/vitalsigns",
                  code: "vitalsigns",
                  display: "Vital Signs"
                }
              ],
              text: "Vital Signs Observations"
            }
          ],
          code: {
            coding: [
              {
                system: "http://rymanhealthcare.co.nz",
                code: "RESP",
                display: "Resp"
              }
            ],
            text: "Resp: RESP"
          },
          subject: {
            reference: "https://apac-syd-partner02-test.apigee.net/rymanfhir/Patient/2143.19",
            type: "Patient",
            display: "VCare residentOID: 2143.19"
          },
          issued: "2019-05-15T16:17:31+12:00",
          valueString: "20 RPM",
          interpretation: [
            {
              coding: [
                {
                  system: "http://rymanhealthcare.co.nz",
                  code: "High",
                  display: "High"
                }
              ],
              text: "High"
            }
          ]
        },
        search: {
          mode: "match"
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
