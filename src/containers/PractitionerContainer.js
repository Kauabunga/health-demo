import React, { Component } from 'react';
import { observer } from 'mobx-react';

import PractitionerState from '../state/PractitionerState';

class PractitionerContainer extends Component {
  static contextType = PractitionerState;

  componentDidMount = () => {
    const { loadPractitioner, practitioners } = this.context;
    const { practitionerId } = this.props;

    const alreadyExists = !!practitioners[practitionerId];
    if (practitionerId && !alreadyExists) {
      setTimeout(() => loadPractitioner(practitionerId));
    }
  };

  render() {
    const { Layout, practitionerId, ...rest } = this.props;
    const { practitioners, practitionerError, practitionerLoading } = this.context;

    const currentPractitioner = practitioners[practitionerId];
    const currentPractitionerError = practitionerError[practitionerId];
    const currentPractitionerLoading =
      practitionerLoading[practitionerId] === undefined ? true : practitionerLoading[practitionerId];

    return (
      <Layout
        {...rest}
        practitionerId={practitionerId}
        currentPractitioner={currentPractitioner}
        currentPractitionerError={currentPractitionerError}
        currentPractitionerLoading={currentPractitionerLoading}
        {...this.context}
      />
    );
  }
}

export default observer(PractitionerContainer);
