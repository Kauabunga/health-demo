import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { red } from '@material-ui/core/colors';

import StandardLayout from '../layout/StandardLayout';
import DelayComponent from './DelayComponent';

const rootStyles = theme => ({
  columnContainer: {
    flexWrap: 'wrap',
    [theme.breakpoints.up('md')]: {
      flexWrap: 'nowrap'
    }
  }
});

const DetailItem = ({ label, value, noWrap }) => (
  <Grid item>
    <Typography>{label}</Typography>
    <Typography variant="subtitle1" style={{ fontWeight: 700 }} noWrap={noWrap}>
      {value || 'unknown'}
    </Typography>
  </Grid>
);

const DetailPractitioner = ({ currentPractitioner }) => (
  <Grid item style={{ paddingRight: 24 }}>
    <DetailItem label="Name" value={currentPractitioner.name} />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />
    <DetailItem label="Email" value={currentPractitioner.email} noWrap />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />
    <DetailItem label="Address" value={currentPractitioner.address} />
    <Divider style={{ marginTop: 12, marginBottom: 12 }} />
  </Grid>
);

function PractitionerDetailComponent(props) {
  const { classes, practitionerId, currentPractitioner, currentPractitionerLoading, currentPractitionerError } = props;

  if (currentPractitionerLoading) {
    return (
      <Grid container alignItems="center" justify="center">
        <DelayComponent wait={100}>
          <CircularProgress />
        </DelayComponent>
      </Grid>
    );
  }

  return (
    <StandardLayout>
      {currentPractitioner && (
        <Grid container direction="row" alignItems="center" style={{ marginBottom: 12 }}>
          {(currentPractitioner && currentPractitioner.photo && (
            <Avatar alt={currentPractitioner.name} src={currentPractitioner.photo} />
          )) || <Avatar>{currentPractitioner.initials}</Avatar>}
          <Typography variant="h6" style={{ marginLeft: 8 }}>
            {currentPractitioner.name} (Practitioner {practitionerId})
          </Typography>

          <div style={{ flexGrow: 1 }}></div>
        </Grid>
      )}

      {currentPractitioner && (
        <Card style={{ padding: 24 }}>
          <Grid container direction="row" className={classes.columnContainer}>
            <DetailPractitioner currentPractitioner={currentPractitioner} />
          </Grid>
        </Card>
      )}

      {currentPractitionerError && (
        <pre style={{ color: red[500], width: '100%', overflowX: 'scroll' }}>
          {JSON.stringify(currentPractitionerError, null, 2)}
        </pre>
      )}
      <Button component={Link} to="/" variant="outlined" color="primary" style={{ marginTop: 12 }}>
        Back
      </Button>
    </StandardLayout>
  );
}

PractitionerDetailComponent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(rootStyles)(PractitionerDetailComponent);
