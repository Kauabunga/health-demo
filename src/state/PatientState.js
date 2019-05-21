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

    return transformPatientSearch(data);
  } catch (error) {
    console.error("Error searching patient", id, birthdate, error);
    await wait(getRandomInt(400, 2500));
    return transformPatientSearch(getDummySearchResult());
  }
}

function transformPatient(patient) {
  const { photo: photos, name, gender, address, telecom, birthDate } = patient || {};
  const [firstPhoto] = photos || [];
  const { data: firstPhotoData } = firstPhoto || {};
  const photo = `data:image/png;base64,${firstPhotoData}`;

  const { value: email } = telecom.find(({ system }) => system === "email") || {};
  const officialName = name.find(({ use }) => use === "official");
  const fullOfficialName = officialName.given.concat(officialName.family).join(" ");

  const { line } = (address && address[0]) || {};

  const prettyAddress =
    line &&
    line
      .join(", ")
      .replace(/^,/gi, "")
      .trim();

  return {
    name: fullOfficialName,
    email,
    address: prettyAddress,
    birthDate,
    photo,
    gender,

    __original__: patient
  };
}

function transformPatientSearch(patientSearch) {
  const { entry, total } = patientSearch || {};

  console.log("transformPatientSearch", total);
  const patientIds = (entry || []).map(({ resource }) => resource && resource.id).filter(id => !!id);

  return {
    patientIds,
    total
  };
}

function getDummySearchResult() {
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

function getDummyPatient() {
  return {
    resourceType: "Patient",
    meta: {
      versionId: "6"
    },
    contained: [
      {
        resourceType: "Practitioner",
        id: "#Practitioner-0130a2fe-1026-4997-9c7e-19a6ec4f51d1",
        identifier: [
          {
            use: "secondary",
            system: "vcaresoftware.com",
            value: "2219.1"
          }
        ],
        name: [
          {
            use: "official",
            family: "Beasley",
            given: ["Johanna"]
          }
        ],
        gender: "female",
        birthDate: "1975-12-11T00:00:00+00:00"
      }
    ],
    identifier: [
      {
        use: "official",
        system: "health.govt.nz",
        value: "CGC2720"
      },
      {
        use: "secondary",
        system: "vcaresoftware.com",
        value: "2143.1"
      }
    ],
    name: [
      {
        use: "official",
        family: "Murray",
        given: ["Rafael"]
      },
      {
        use: "usual",
        given: ["Rafael"]
      }
    ],
    telecom: [
      {
        system: "email",
        value: "rafael.murray@fakeresident.rymanhealthcare.com",
        use: "home",
        period: {
          start: "2011-01-01T00:00:00+00:00",
          end: "1900-01-01T00:00:00+00:00"
        }
      }
    ],
    gender: "unknown",
    birthDate: "01/01/1935",
    address: [
      {
        text: ", Ada Lovelace\nUnit C\nAirport Business Park\n92 Russley Rd\nRussley, Christchurch\n\n 8140",
        line: [", Ada Lovelace", "Unit C", "Airport Business Park", "92 Russley Rd", "Russley, Christchurch"],
        city: "",
        postalCode: "8140",
        country: "NZ",
        period: {
          start: "2019-04-24T00:00:00+00:00",
          end: "1900-01-01T00:00:00+00:00"
        }
      }
    ],
    photo: [
      {
        data:
          "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",
        hash: "v5YTbSHsGhA1dVzi9ykOGpxyCng="
      }
    ],
    generalPractitioner: [
      {
        reference: "#Practitioner-0130a2fe-1026-4997-9c7e-19a6ec4f51d1",
        display: "GP"
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
