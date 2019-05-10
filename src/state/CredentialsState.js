import React from 'react';
import { decorate, observable, action } from 'mobx';
import store from 'store';
import qs from 'qs';

const { hash } = document.location;
const startingQueryParams = qs.parse(String(hash || '').replace('#', ''));
const { client_id, client_secret } = startingQueryParams;

if (client_id) {
  store.set('client_id', client_id);
}

if (client_secret) {
  store.set('client_secret', client_secret);
}

if (client_id || client_secret) {
  removeHash();
}

class CredentialsState {
  client_id = store.get('client_id') || '';
  client_secret = store.get('client_secret') || '';

  base_uri = store.get('base_uri') || 'https://apac-syd-partner02-test.apigee.net';
  base_path_oauth = store.get('base_path_oauth') || '/ryman-oauth/token';
  base_path_patient = store.get('base_path_patient') || '/rymanfhir/fhir/Patient';

  handleBaseUriChange = handleChange('base_uri').bind(this);
  handleBasePathOAuthChange = handleChange('base_path_oauth').bind(this);
  handleBasePathPatientChange = handleChange('base_path_patient').bind(this);

  handleClientIdChange = handleChange('client_id').bind(this);
  handleClientSecretChange = handleChange('client_secret').bind(this);
}

function handleChange(key) {
  return function(event) {
    store.set(key, event.target.value);
    this[key] = event.target.value;
  };
}

const decorated = decorate(CredentialsState, {
  client_id: observable,
  client_secret: observable,
  handleClientIdChange: action,
  handleClientSecretChange: action,

  base_uri: observable,
  base_path_oauth: observable,
  base_path_patient: observable,
  handleBaseUriChange: action,
  handleBasePathOAuthChange: action,
  handleBasePathPatientChange: action,
});

export const credentialsStore = new decorated();

export default React.createContext(credentialsStore);

function removeHash() {
  var scrollV,
    scrollH,
    loc = window.location;
  if ('pushState' in window.history) {
    window.history.pushState('', document.title, loc.pathname + loc.search);
  } else {
    // Prevent scrolling by storing the page's current scroll offset
    scrollV = document.body.scrollTop;
    scrollH = document.body.scrollLeft;

    loc.hash = '';

    // Restore the scroll offset, should be flicker free
    document.body.scrollTop = scrollV;
    document.body.scrollLeft = scrollH;
  }
}
