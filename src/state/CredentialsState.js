import React from "react";
import { decorate, observable, action } from "mobx";
import store from "store";
import qs from "qs";

const { hash } = document.location;
const startingQueryParams = qs.parse(String(hash || "").replace("#", ""));
const { client_id, client_secret } = startingQueryParams;

if (client_id) {
  store.set("client_id", client_id);
}

if (client_secret) {
  store.set("client_secret", client_secret);
}

if (client_id || client_secret) {
  removeHash();
}

function getBooleanStore(key, defaultValue) {
  const val = store.get(key);
  if (typeof val !== "undefined") {
    return val;
  }
  return defaultValue;
}

class CredentialsState {
  client_id = store.get("client_id") || "";
  client_secret = store.get("client_secret") || "";

  base_uri = store.get("base_uri") || "https://rymanhealthcare-dev.apigee.net";
  base_path_oauth = store.get("base_path_oauth") || "/ryman-oauth/token";
  base_path_patient = store.get("base_path_patient") || "/fhir4-0-0/Patient";
  base_path_observation = store.get("base_path_observation") || "/fhir4-0-0/Observation";
  base_path_composition = store.get("base_path_composition") || "/fhir4-0-0/Composition";
  base_path_transferpack = store.get("base_path_transferpack") || "/fhir4-0-0/CreateTransferPack";

  handleBaseUriChange = handleChangeText("base_uri").bind(this);
  handleBasePathOAuthChange = handleChangeText("base_path_oauth").bind(this);
  handleBasePathPatientChange = handleChangeText("base_path_patient").bind(this);
  handleBasePathObservationChange = handleChangeText("base_path_observation").bind(this);
  handleBasePathCompositionChange = handleChangeText("base_path_composition").bind(this);
  handleBasePathTransferPackChange = handleChangeText("base_path_transferpack").bind(this);

  handleClientIdChange = handleChangeText("client_id").bind(this);
  handleClientSecretChange = handleChangeText("client_secret").bind(this);

  errorsObservation = getBooleanStore("errorsObservation", true);
  handleErrorsObservationChange = handleChangeCheckbox("errorsObservation").bind(this);
  errorsPatient = getBooleanStore("errorsPatient", true);
  handleErrorsPatientChange = handleChangeCheckbox("errorsPatient").bind(this);
  errorsCondition = getBooleanStore("errorsCondition", true);
  handleErrorsConditionChange = handleChangeCheckbox("errorsCondition").bind(this);
}

function handleChangeCheckbox(key) {
  return function(event) {
    store.set(key, event.target.checked);
    this[key] = event.target.checked;
  };
}

function handleChangeText(key) {
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
  base_path_observation: observable,
  base_path_composition: observable,
  base_path_transferpack: observable,
  handleBaseUriChange: action,
  handleBasePathOAuthChange: action,
  handleBasePathPatientChange: action,
  handleBasePathObservationChange: action,
  handleBasePathCompositionChange: action,
  handleBasePathTransferPackChange: action,

  errorsObservation: observable,
  handleErrorsObservationChange: action,
  errorsPatient: observable,
  handleErrorsPatientChange: action,
  errorsCondition: observable,
  handleErrorsConditionChange: action
});

export const credentialsStore = new decorated();

export default React.createContext(credentialsStore);

function removeHash() {
  var scrollV,
    scrollH,
    loc = window.location;
  if ("pushState" in window.history) {
    window.history.pushState("", document.title, loc.pathname + loc.search);
  } else {
    // Prevent scrolling by storing the page's current scroll offset
    scrollV = document.body.scrollTop;
    scrollH = document.body.scrollLeft;

    loc.hash = "";

    // Restore the scroll offset, should be flicker free
    document.body.scrollTop = scrollV;
    document.body.scrollLeft = scrollH;
  }
}
