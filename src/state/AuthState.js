import React from "react";
import { decorate, observable, action } from "mobx";
import store from "store";
import axios from "axios";
// import qs from "qs";

import { credentialsStore } from "./CredentialsState";

class AuthState {
  isAuthenticated = !!store.get("session");
  session = store.get("session") || null;
  error = null;
  errorMessage = null;
  authenticating = false;

  updateSession = session => {
    store.set("session", session);

    const isAuthenticated = !!session;
    this.isAuthenticated = isAuthenticated;
    this.session = session;
    this.loading = false;
  };

  handleLogout = () => {
    this.updateSession(null);
  };

  handleLogin = async () => {
    this.loading = true;
    this.error = null;
    this.errorMessage = null;

    const { base_path_oauth, base_uri, client_id, client_secret } = credentialsStore;
    const payload = {
      grant_type: "client_credentials",
      client_id,
      client_secret,
      identityContext: {
        pmsId: "drjohn@somepractice.com",
        practice: "Some Practice"
      }
    };

    try {
      const { status, data } = await axios.post(
        `${base_uri}${base_path_oauth}`,
        // qs.stringify(payload),
        payload,
        {
          headers: {
            // "Content-Type": "application/x-www-form-urlencoded",
            "Content-Type": "application/json",
            Accept: "application/json"
          }
        }
      );

      if (status !== 200) {
        throw new Error(`Invalid status ${status}`);
      }

      this.updateSession(data);
    } catch (error) {
      console.error("Error doing login", error);
      this.errorMessage = error.message;
      this.error = error;
      this.updateSession(null);
    }
  };
}

const decorated = decorate(AuthState, {
  isAuthenticated: observable,
  session: observable,
  error: observable,
  errorMessage: observable,
  authenticating: observable,

  handleLogin: action,
  handleLogout: action
});

export const authStore = new decorated();

export default React.createContext(authStore);
