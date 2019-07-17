import React from 'react';
import { decorate, observable, action } from 'mobx';
import axios from 'axios';

import { credentialsStore } from './CredentialsState';
import { authStore } from './AuthState';

class PractitionerState {
  practitionerLoading = {};
  practitionerError = {};
  practitioners = {};

  loadPractitioner = async practitionerId => {
    this.practitionerLoading = { ...this.practitionerLoading, [practitionerId]: true };
    this.practitionerError = { ...this.practitionerError, [practitionerId]: null };

    try {
      const practitioner = await getPractitioner(practitionerId);
      this.practitioners = { ...this.practitioners, [practitionerId]: practitioner };
    } catch (error) {
      console.log('Error getting practitioner', practitionerId, error);
      this.practitionerError = {
        ...this.practitionerError,
        [practitionerId]: {
          message: error.message,
          error: error
        }
      };
    }

    this.practitionerLoading = { ...this.practitionerLoading, [practitionerId]: false };
  };
}

const decorated = decorate(PractitionerState, {
  practitionerIds: observable,

  practitionerLoading: observable,
  practitionerError: observable,
  practitioners: observable,

  loadPractitioner: action
});

export const practitionerStore = new decorated();

export default React.createContext(practitionerStore);

async function getPractitioner(practitionerId) {
  const { client_id, base_uri, base_path_practitioner, errorsPractitioner } = credentialsStore;
  const { session } = authStore;
  const { id_token } = session || {};

  const Authorization = `Bearer ${id_token}`;
  const url = `${base_uri}${base_path_practitioner}/${practitionerId}`;

  try {
    const { status, data } = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        Authorization,
        apikey: client_id
      }
    });

    if (status !== 200) {
      throw new Error(`Invalid status ${status}`);
    }

    return transformPractitioner(data);
  } catch (error) {
    console.error('Error getting practitioner', errorsPractitioner, practitionerId, error);

    // If errors are enabled
    if (errorsPractitioner) {
      throw error;
    }

    await wait(getRandomInt(400, 2500));
    return transformPractitioner(getDummyPractitioner());
  }
}

export function transformPractitioner(practitioner) {
  const { photo: photos, extension, name, gender, address, contact, telecom, birthDate } = practitioner || {};

  // PHOTO
  const [firstPhoto] = photos || [];
  const { data: firstPhotoData } = firstPhoto || {};
  const photo = firstPhotoData && `data:image/png;base64,${firstPhotoData}`;

  // EMAIL
  const { value: email } = telecom.find(({ system }) => system === 'email') || {};

  // NAME
  const officialName = name.find(({ use }) => use === 'official');
  const fullOfficialName = officialName.given.concat(officialName.family).join(' ');

  // ADDRESS
  const { line } = (address && address[0]) || {};
  const prettyAddress =
    line &&
    line
      .filter(l => !!l)
      .join(', ')
      .replace(/^,/gi, '')
      .trim();

  // INITIALS
  const initials = fullOfficialName.match(/\b\w/g) || [];
  const formattedInitials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();

  // NEXT OF KIN
  const nextOfKinContact = contact;
  const nextOfKins = (nextOfKinContact || []).map(currentKin => {
    const nextOfKinName =
      currentKin && currentKin.name && currentKin.name.given.concat(currentKin.name.family).join(' ');
    const nextOfKinPhone = currentKin && currentKin.telecom.find(({ system }) => system === 'phone');
    const nextOfKinEmail = currentKin && currentKin.telecom.find(({ system }) => system === 'email');
    const nextOfKinGender = currentKin && currentKin.gender;
    const nextOfKinRelationship = currentKin && currentKin.relationship.map(({ text }) => text).join(', ');
    return {
      name: nextOfKinName,
      phone: nextOfKinPhone && nextOfKinPhone.value,
      email: nextOfKinEmail && nextOfKinEmail.value,
      gender: nextOfKinGender,
      relationship: nextOfKinRelationship
    };
  });

  // EXTENSIONS
  const carePlanExtension = extension.find(({ url }) => url && url.includes('CareLevel'));
  const carePlan = carePlanExtension && carePlanExtension.valueCoding.display;
  const ethnicityExtension = extension.find(({ url }) => url && url.includes('Ethnicities'));
  const ethnicity = ethnicityExtension && ethnicityExtension.valueCoding.display;

  // MARITAL STATUS
  const maritalStatus = practitioner.maritalStatus && practitioner.maritalStatus.text;

  const officialIdentifier = (practitioner.identifier || []).find(({ use }) => use === 'official');
  const secondaryIdentifier = (practitioner.identifier || []).find(({ use }) => use === 'secondary');

  // RESULT
  return {
    nhi: officialIdentifier && officialIdentifier.value,
    vcareId: secondaryIdentifier && secondaryIdentifier.value,
    name: fullOfficialName,
    initials: formattedInitials,
    email,
    address: prettyAddress,
    birthDate,
    photo,
    gender,

    carePlan,
    maritalStatus,
    ethnicity,

    nextOfKins,

    __original__: practitioner
  };
}

export function getDummyPractitioner() {
  return {
    resourceType: 'Practitioner',
    id: '2143.19',
    meta: {
      versionId: '6'
    },
    extension: [
      {
        url: 'http://apac-syd-partner02-test.apigee.net/fhir4-0-0/Extensions/Practitioner/CareLevel',
        valueCoding: {
          system: 'http://rymanhealthcare.co.nz',
          code: 'R-D1',
          display: 'Dementia - Respite'
        }
      },
      {
        url: 'http://apac-syd-partner02-test.apigee.net/fhir4-0-0/Extensions/Practitioner/Ethnicities',
        valueCoding: {
          system: 'http://rymanhealthcare.co.nz',
          code: '11',
          display: 'NZ European'
        }
      }
    ],
    identifier: [
      {
        use: 'official',
        system: 'http://health.govt.nz/nhi',
        value: 'ZBP8438'
      },
      {
        use: 'secondary',
        system: 'http://rymanhealthcare.co.nz',
        value: '2143.19'
      }
    ],
    name: [
      {
        use: 'official',
        family: 'Roberson',
        given: ['Kloe'],
        prefix: ['Mrs']
      },
      {
        use: 'usual',
        given: ['Kloe']
      }
    ],
    telecom: [
      {
        system: 'email',
        value: 'Kloe.Roberson@residents.AdaLovelace.testvillages.rymanhealthcare.com',
        use: 'home',
        period: {
          start: '2018-04-04T00:00:00+00:00',
          end: '1900-01-01T00:00:00+00:00'
        }
      },
      {
        system: 'phone',
        value: 'tel:-1-3334293',
        use: 'home',
        period: {
          start: '2018-04-04T00:00:00+00:00',
          end: '1900-01-01T00:00:00+00:00'
        }
      },
      {
        system: 'phone',
        value: 'tel:-5-246433;ext="',
        use: 'home',
        period: {
          start: '2018-04-04T00:00:00+00:00',
          end: '1900-01-01T00:00:00+00:00'
        }
      }
    ],
    gender: 'unknown',
    birthDate: '1916-02-02',
    address: [
      {
        use: 'home',
        type: 'physical',
        text: 'D021,Dementia,Ada Lovelace,OTHER',
        line: ['D021', 'Dementia', 'Ada Lovelace', '', '', '', '', '', 'OTHER'],
        city: '',
        postalCode: '',
        country: 'OTHER',
        period: {
          start: '2018-04-04T00:00:00+00:00',
          end: '1900-01-01T00:00:00+00:00'
        }
      }
    ],
    maritalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
          code: 'W',
          display: 'Widowed'
        }
      ],
      text: 'Widowed'
    },
    photo: [
      {
        contentType: 'image/jpeg',
        data: '',
        size: 0,
        hash: '2jmj7l5rSw0yVb/vlWAYkK/YBwk=',
        title: 'Small picture'
      },
      {
        contentType: 'image/jpeg',
        data: '',
        size: 0,
        hash: '2jmj7l5rSw0yVb/vlWAYkK/YBwk=',
        title: 'Large picture'
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                code: 'N',
                display: 'Next-of-Kin'
              }
            ],
            text: 'First Next-of-Kin (Son)'
          }
        ],
        name: {
          use: 'official',
          family: 'Mcfadden',
          given: ['Charles']
        },
        telecom: [
          {
            system: 'email',
            value: 'Charles.Mcfadden@nok.AdaLovelace.testvillages.rymanhealthcare.com',
            use: 'home',
            period: {
              start: '2019-05-27T00:00:00+00:00',
              end: '1900-01-01T00:00:00+00:00'
            }
          },
          {
            system: 'other',
            value: 'PHYSICAL',
            use: 'home',
            period: {
              start: '2019-05-27T00:00:00+00:00',
              end: '1900-01-01T00:00:00+00:00'
            }
          }
        ],
        gender: 'male',
        period: {
          start: '2000-01-01T00:00:00+00:00',
          end: '1900-01-01T00:00:00+00:00'
        }
      },
      {
        relationship: [
          {
            text: 'Pending Enduring Power of Attorney'
          }
        ],
        name: {
          use: 'official',
          family: 'Mcfadden',
          given: ['Charles']
        },
        telecom: [
          {
            system: 'email',
            value: 'Charles.Mcfadden@nok.AdaLovelace.testvillages.rymanhealthcare.com',
            use: 'home',
            period: {
              start: '2019-05-27T00:00:00+00:00',
              end: '1900-01-01T00:00:00+00:00'
            }
          },
          {
            system: 'other',
            value: 'PHYSICAL',
            use: 'home',
            period: {
              start: '2019-05-27T00:00:00+00:00',
              end: '1900-01-01T00:00:00+00:00'
            }
          }
        ],
        gender: 'male',
        period: {
          start: '2000-01-01T00:00:00+00:00',
          end: '1900-01-01T00:00:00+00:00'
        }
      },
      {
        relationship: [
          {
            text: 'EPOA Active - Personal Care & Welfare'
          }
        ],
        name: {
          use: 'official',
          family: 'Marshall',
          given: ['Willow']
        },
        telecom: [
          {
            system: 'email',
            value: 'Willow.Marshall@nok.AdaLovelace.testvillages.rymanhealthcare.com',
            use: 'home',
            period: {
              start: '2019-05-27T00:00:00+00:00',
              end: '1900-01-01T00:00:00+00:00'
            }
          },
          {
            system: 'other',
            value: 'PHYSICAL',
            use: 'home',
            period: {
              start: '2019-05-27T00:00:00+00:00',
              end: '1900-01-01T00:00:00+00:00'
            }
          }
        ],
        gender: 'male',
        period: {
          start: '2000-01-01T00:00:00+00:00',
          end: '1900-01-01T00:00:00+00:00'
        }
      },
      {
        relationship: [
          {
            text: 'Pending Enduring Power of Attorney'
          }
        ],
        name: {
          use: 'official',
          family: 'Gill',
          given: ['Mohsin']
        },
        telecom: [
          {
            system: 'email',
            value: 'Mohsin.Gill@nok.AdaLovelace.testvillages.rymanhealthcare.com',
            use: 'home',
            period: {
              start: '2019-05-27T00:00:00+00:00',
              end: '1900-01-01T00:00:00+00:00'
            }
          },
          {
            system: 'other',
            value: 'PHYSICAL',
            use: 'home',
            period: {
              start: '2019-05-27T00:00:00+00:00',
              end: '1900-01-01T00:00:00+00:00'
            }
          }
        ],
        gender: 'male',
        period: {
          start: '2000-01-01T00:00:00+00:00',
          end: '1900-01-01T00:00:00+00:00'
        }
      }
    ],
    communication: [
      {
        language: {
          coding: [
            {
              system: 'http://rymanhealthcare.co.nz',
              code: 'eng',
              display: 'English'
            }
          ],
          text: 'English'
        }
      }
    ],
    generalPractitioner: [
      {
        reference: 'http://apac-syd-partner02-test.apigee.net/fhir4-0-0/Practitioner/2219.2',
        type: 'Practitioner',
        display: 'Arnold Leith'
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
