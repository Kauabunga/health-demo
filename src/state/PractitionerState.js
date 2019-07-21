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
  const { client_id, base_uri, base_path_practitioner } = credentialsStore;
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
    console.error('Error getting practitioner', practitionerId, error);

    throw error;
  }
}

export function transformPractitioner(practitioner) {
  const { photo: photos, name, gender, address, contact, telecom, birthDate } = practitioner || {};

  // PHOTO
  const [firstPhoto] = photos || [];
  const { data: firstPhotoData } = firstPhoto || {};
  const photo = firstPhotoData && `data:image/png;base64,${firstPhotoData}`;

  // EMAIL
  const { value: email } = (telecom || []).find(({ system }) => system === 'email') || {};

  // PHONE
  const { value: phone } = (telecom || []).find(({ system }) => system === 'phone') || {};

  // NAME
  const officialName = (name || []).find(({ use }) => use === 'official');
  const fullOfficialName = officialName && officialName.given.concat(officialName.family).join(' ');

  // ADDRESS
  const { line, text: addressText } = (address && address[0]) || {};
  const prettyAddress =
    (line &&
      line
        .filter(l => !!l)
        .join(', ')
        .replace(/^,/gi, '')
        .trim()) ||
    addressText;

  // INITIALS
  const initials = (fullOfficialName && fullOfficialName.match(/\b\w/g)) || [];
  const formattedInitials = initials && ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();

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
    phone,
    birthDate,
    photo,
    gender,

    nextOfKins,

    __original__: practitioner
  };
}
