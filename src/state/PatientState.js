import React from "react";
import { decorate, observable, computed, action } from "mobx";
import axios from "axios";
import qs from "qs";

import { credentialsStore } from "./CredentialsState";
import { authStore } from "./AuthState";

class PatientState {
  patientIds = ["2143.1"];

  patientLoading = {};
  patientError = {};
  patients = {};

  patientSearchLoading = {};
  patientSearchError = {};
  patientSearch = {};
  currentPatientSearch = null;
  searchBirthdate = "1931-08-18";
  searchNhi = "";

  constructor() {
    this.debounceSearchPatient = debounce(this.debounceSearchPatient.bind(this), 200);
  }

  get currentSearchResult() {
    return this.patientSearch[this.currentPatientSearch];
  }

  get isSearchLoading() {
    return !!this.patientSearchLoading[this.currentPatientSearch];
  }

  get isSearchError() {
    return this.patientSearchError[this.currentPatientSearch];
  }

  searchPatient = async (id, birthdate) => {
    const currentPatientSearch = `${id}-${birthdate}`;
    this.searchNhi = id;
    this.searchBirthdate = birthdate;

    this.currentPatientSearch = currentPatientSearch;
    this.patientSearchLoading = { ...this.patientSearchLoading, [currentPatientSearch]: true };
    this.patientSearchError = { ...this.patientSearchError, [currentPatientSearch]: null };

    this.debounceSearchPatient(id, birthdate);
  };

  debounceSearchPatient = async (id, birthdate) => {
    const currentPatientSearch = `${id}-${birthdate}`;
    try {
      const patient = await searchPatient(id, birthdate);
      this.patientSearch = { ...this.patientSearch, [currentPatientSearch]: patient };
    } catch (error) {
      console.log("Error searching patient", currentPatientSearch, error);
      if (this.currentPatientSearch === currentPatientSearch) {
        this.patientSearchError = {
          ...this.patientSearchError,
          [currentPatientSearch]: {
            message: error.message,
            error: error
          }
        };
      }
    }

    if (this.currentPatientSearch === currentPatientSearch) {
      this.patientSearchLoading = { ...this.patientSearchLoading, [currentPatientSearch]: false };
    }
  };

  loadPatient = async patientId => {
    this.patientLoading = { ...this.patientLoading, [patientId]: true };
    this.patientError = { ...this.patientError, [patientId]: null };

    try {
      const patient = await getPatient(patientId);
      this.patients = { ...this.patients, [patientId]: patient };
    } catch (error) {
      console.log("Error getting patient", patientId, error);
      this.patientError = {
        ...this.patientError,
        [patientId]: {
          message: error.message,
          error: error
        }
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

  currentSearchResult: computed,
  isSearchLoading: computed,
  isSearchError: computed,

  searchBirthdate: observable,
  searchNhi: observable,
  patientSearchLoading: observable,
  patientSearchError: observable,
  patientSearch: observable,
  searchPatient: action
});

export const patientStore = new decorated();

export default React.createContext(patientStore);

async function getPatient(patientId) {
  const { client_id, base_uri, base_path_patient } = credentialsStore;
  const { session } = authStore;
  const { id_token } = session || {};

  const Authorization = `Bearer ${id_token}`;
  const url = `${base_uri}${base_path_patient}/${patientId}`;
  // const proxyUrl = `https://ryman-healthcare-demo-api.busy-bee.now.sh/${url}`;

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

    return transformPatient(data);
  } catch (error) {
    console.error("Error getting patient", patientId, error);
    await wait(getRandomInt(400, 2500));
    return transformPatient(getDummyPatient());
  }
}

async function searchPatient(id, birthdate) {
  const { client_id, base_uri, base_path_patient } = credentialsStore;
  const { session } = authStore;
  const { id_token } = session || {};

  if (!id || !birthdate) {
    return null;
  }

  const params = { identifier: `http://health.govt.nz/nhi|${id}`, birthdate, _format: "json" };
  const Authorization = `Bearer ${id_token}`;
  const url = `${base_uri}${base_path_patient}/_search?${qs.stringify(params)}`;

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

    const { issue, error } = data || {};
    if (issue || error) {
      return transformPatientSearch(getDummySearchResult());
    }

    return transformPatientSearch(data);
  } catch (error) {
    console.error("Error searching patient", id, birthdate, error);
    await wait(getRandomInt(400, 2500));
    return transformPatientSearch(getDummySearchResult());
  }
}

export function transformPatient(patient) {
  const { photo: photos, name, gender, address, contact, telecom, birthDate } = patient || {};

  // PHOTO
  const [firstPhoto] = photos || [];
  const { data: firstPhotoData } = firstPhoto || {};
  const photo = firstPhotoData && `data:image/png;base64,${firstPhotoData}`;

  // EMAIL
  const { value: email } = telecom.find(({ system }) => system === "email") || {};

  // NAME
  const officialName = name.find(({ use }) => use === "official");
  const fullOfficialName = officialName.given.concat(officialName.family).join(" ");

  // ADDRESS
  const { line } = (address && address[0]) || {};
  const prettyAddress =
    line &&
    line
      .filter(l => !!l)
      .join(", ")
      .replace(/^,/gi, "")
      .trim();

  // INITIALS
  const initials = fullOfficialName.match(/\b\w/g) || [];
  const formattedInitials = ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();

  // NEXT OF KIN
  const nextOfKinContact = contact.find(
    ({ relationship }) => !!relationship.find(({ coding }) => !!coding.find(({ code }) => code === "N"))
  );
  const nextOfKinName =
    nextOfKinContact &&
    nextOfKinContact.name &&
    nextOfKinContact.name.given.concat(nextOfKinContact.name.family).join(" ");

  const nextOfKinPhone = nextOfKinContact && nextOfKinContact.telecom.find(({ system }) => system === "phone");
  const nextOfKinEmail = nextOfKinContact && nextOfKinContact.telecom.find(({ system }) => system === "email");
  const nextOfKin = {
    name: nextOfKinName,
    phone: nextOfKinPhone && nextOfKinPhone.value,
    email: nextOfKinEmail && nextOfKinEmail.value
  };

  // RESULT
  return {
    name: fullOfficialName,
    initials: formattedInitials,
    email,
    address: prettyAddress,
    birthDate,
    photo,
    gender,

    nextOfKin,

    __original__: patient
  };
}

export function transformPatientSearch(patientSearch) {
  const { entry, total } = patientSearch || {};

  const patientIds = (entry || []).map(({ resource }) => resource && resource.id).filter(id => !!id);

  return {
    patientIds,
    total
  };
}

export function getDummySearchResult() {
  return {
    resourceType: "Bundle",
    type: "searchset",
    total: 1,
    link: [
      {
        relation: "self",
        url:
          "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Patient?identifier=http://health.govt.nz/nhi%7CZGL5346&birthdate=1931-08-18"
      }
    ],
    entry: [
      {
        fullUrl: "https://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Patient/2143.19",
        resource: {
          resourceType: "Patient",
          id: "2143.19",
          identifier: [
            {
              use: "official",
              system: "http://health.govt.nz/nhi",
              value: "ZGL5346"
            },
            {
              use: "secondary",
              system: "http://rymanhealthcare.co.nz",
              value: "2143.19"
            }
          ],
          name: [
            {
              use: "official",
              family: "Foster",
              given: ["Willow"],
              prefix: ["Mr"]
            },
            {
              use: "usual",
              given: ["Willow"]
            }
          ],
          gender: "unknown",
          birthDate: "1931-08-18"
        },

        search: {
          mode: "match"
        }
      }
    ]
  };
}

export function getDummyPatient() {
  return {
    resourceType: "Patient",
    id: "2143.19",
    meta: {
      versionId: "8"
    },
    identifier: [
      {
        use: "official",
        system: "http://health.govt.nz/nhi",
        value: "ZGL5346"
      },
      {
        use: "secondary",
        system: "http://rymanhealthcare.co.nz",
        value: "2143.19"
      }
    ],
    name: [
      {
        use: "official",
        family: "Foster",
        given: ["Willow"]
      },
      {
        use: "usual",
        given: ["Willow"]
      }
    ],
    telecom: [
      {
        system: "email",
        value: "Willow.Foster@residents.AdaLovelace.testvillages.rymanhealthcare.com",
        use: "home",
        period: {
          start: "2011-06-08T00:00:00+00:00",
          end: "1900-01-01T00:00:00+00:00"
        }
      },
      {
        system: "phone",
        value: "tel:-1-686680",
        use: "home",
        period: {
          start: "2019-05-06T00:00:00+00:00",
          end: "1900-01-01T00:00:00+00:00"
        }
      }
    ],
    gender: "unknown",
    birthDate: "1931-08-18",
    address: [
      {
        use: "home",
        type: "physical",
        text: "D003,Dementia,Ada Lovelace,OTHER",
        line: ["D003", "Dementia", "Ada Lovelace", "", "", "", "", "", "OTHER"],
        city: "",
        postalCode: "",
        country: "OTHER",
        period: {
          start: "2019-05-06T00:00:00+00:00",
          end: "1900-01-01T00:00:00+00:00"
        }
      }
    ],
    photo: [
      {
        data: "",
        hash: "2jmj7l5rSw0yVb/vlWAYkK/YBwk="
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0131",
                code: "N",
                display: "Next-of-Kin"
              }
            ],
            text: "First Next-of-Kin (Son)"
          }
        ],
        name: {
          use: "official",
          family: "Foster",
          given: ["Kane"]
        },
        telecom: [
          {
            system: "email",
            value: "kane.foster@nok.adalovelace.testvillages.rymanhealthcare.com",
            use: "home",
            period: {
              start: "2019-05-07T00:00:00+00:00",
              end: "1900-01-01T00:00:00+00:00"
            }
          },
          {
            system: "phone",
            value: "tel:+64-55-51234567",
            use: "home",
            period: {
              start: "2019-05-07T00:00:00+00:00",
              end: "1900-01-01T00:00:00+00:00"
            }
          }
        ],
        gender: "male",
        period: {
          start: "2000-01-01T00:00:00+00:00",
          end: "1900-01-01T00:00:00+00:00"
        }
      },
      {
        relationship: [
          {
            coding: [
              {
                system: "http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype",
                code: "DPOWATT",
                display: "durable power of attorney"
              }
            ],
            text: "Activated Enduring Power of Attorney"
          }
        ],
        name: {
          use: "official",
          family: "Foster",
          given: ["Kane"]
        },
        telecom: [
          {
            system: "email",
            value: "kane.foster@nok.adalovelace.testvillages.rymanhealthcare.com",
            use: "home",
            period: {
              start: "2019-05-07T00:00:00+00:00",
              end: "1900-01-01T00:00:00+00:00"
            }
          },
          {
            system: "phone",
            value: "tel:+64-55-51234567",
            use: "home",
            period: {
              start: "2019-05-07T00:00:00+00:00",
              end: "1900-01-01T00:00:00+00:00"
            }
          }
        ],
        gender: "male",
        period: {
          start: "2000-01-01T00:00:00+00:00",
          end: "1900-01-01T00:00:00+00:00"
        }
      }
    ],
    generalPractitioner: [
      {
        reference: "http://apac-syd-partner02-test.apigee.net/rymanfhir/fhir/Practitioner/2219.2",
        type: "Practitioner",
        display: "Arnold Leith"
      }
    ]
  };
}

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
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
