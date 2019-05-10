import React from "react";
import { decorate, observable, action } from "mobx";
import store from "store";
import axios from "axios";
import qs from "qs";

import { credentialsStore } from "./CredentialsState";

class AuthState {
  isAuthenticated = !!store.get("session");
  session = store.get("session") || null;
  error = null;
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

    const { base_path_oauth, base_uri, client_id, client_secret } = credentialsStore;
    try {
      const { status, data } = await axios.post(
        `${base_uri}${base_path_oauth}`,
        qs.stringify({ grant_type: "client_credentials", client_id, client_secret }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json"
          }
        }
      );

      if (status !== 200) {
        throw new Error(`Invalid status ${status}`);
      }

      this.updateSession(data);
    } catch (err) {
      console.error("Error doing login", err);
      this.error = err;
      this.updateSession(null);
    }
  };
}

const decorated = decorate(AuthState, {
  isAuthenticated: observable,
  session: observable,
  error: observable,
  authenticating: observable,

  handleLogin: action,
  handleLogout: action
});

export const authStore = new decorated();

export default React.createContext(authStore);
