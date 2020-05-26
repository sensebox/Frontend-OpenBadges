import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getBadges } from '../../actions/badgeActions';

import axios from 'axios';
import moment from 'moment';

import CreateBadge from '../badge/CreateBadge';

import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Alert from '@material-ui/lab/Alert';
import Avatar from '@material-ui/core/Avatar';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Link from '@material-ui/core/Link';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';



export class CreateCourse extends Component {

  state = {
    course: 'presence',
    open: false,
    msg: null,
    msgType: null,
    file: null,
    url: null,
    name: '',
    globalbadge: [],
    localbadge: [],
    courseprovider: '',
    postalcode: '',
    addresses: [],
    address: '',
    coordinates: [],
    topic: '',
    description: '',
    requirements: '',
    startdate: null,
    enddate: null,
    size: ''
  }

  componentDidMount(){
    this.props.getBadges({independent: false});
  }

  componentDidUpdate(previousProps, previousState) {
    if(previousState.open === true){
      this.setState({ open: false });
    }
    if(this.state.msg){
      window.scrollTo(0, 0);
    }
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onFileChange = (e) => {
    var extensionType = e.target.files[0].type.split('image/')[1];
    if(extensionType !== 'png' && extensionType !== 'jpg' && extensionType !== 'gif' && extensionType !== 'jpeg') {
      this.setState({ msgType: 'error', msg: 'Es sind nur Bilder mit der Dateiendung "PNG", "JPG", "JPEG" und "GIF" erlaubt.' });
    }
    else {
      this.setState({ msgType: null, msg: null, file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) });
    }
  };

  onChangeAddress = e => {
    if(e.target.value){
      axios.get(`https://nominatim.openstreetmap.org/search?format=json&limit=3&q=${e.target.value}`)
        .then(res => {
          if(res.data.length > 0){
            this.setState({addresses: res.data});
          } else {
            this.setState({addresses: ['Keine Übereinstimmung gefunden.']});
          }
        })
        .catch(err => {
          this.setState({msgType: 'error', msg: err.response.data.message});
        });
    }
    else {
      this.setState({addresses: []});
    }
  };

  deleteAddress = () => {
    this.setState({ addresses: [], address: '' });
  };

  setAddress = (address) => {
    this.setState({ addresses: [], address: address.display_name, coordinates: [address.lon, address.lat] });
  };

  onChangeBadge = e => {
    // https://stackoverflow.com/questions/61115871/finddomnode-error-on-react-material-ui-select-menu
    this.setState({ [e.target.name]: e.target.value });
  };

  onReset = () => {
    this.setState({
      course: 'presence',
      open: false,
      msg: null,
      msgType: null,
      file: null,
      url: null,
      name: '',
      globalbadge: [],
      localbadge: [],
      courseprovider: '',
      postalcode: '',
      addresses: [],
      address: '',
      coordinates: [],
      topic: '',
      description: '',
      requirements: '',
      startdate: null,
      enddate: null,
      size: ''
    });
  };

  onSubmit = e => {
    e.preventDefault();
    const { course, name, globalbadge, localbadge, courseprovider, postalcode, address, coordinates, topic, description, requirements, startdate, enddate, size, file } = this.state;
    var newCourse = new FormData();
    newCourse.set('name', name);
    newCourse.set('courseprovider', courseprovider);
    newCourse.set('topic', topic);
    newCourse.set('description', description);
    newCourse.set('requirements', requirements);
    newCourse.set('startdate', startdate);
    newCourse.set('enddate', enddate);
    newCourse.set('size', size);
    globalbadge.forEach((item, i) => {
      newCourse.append('badge[]', item);
    });
    localbadge.forEach((item, i) => {
      newCourse.append('localbadge[]', item);
    });
    if(file){
      newCourse.append('image', file);
    }
    if(course !== 'online'){
      newCourse.set('postalcode', postalcode);
      newCourse.set('address', address);
      coordinates.forEach((item, i) => {
        newCourse.append('coordinates[]', item);
      });
    }
    const config = {
      success: res => {
        this.setState({msgType: 'success', msg: res.data.message});
      },
      error: err => {
        this.setState({msgType: 'error', msg: err.response.data.message});
      }
    };
    axios.post('/api/v1/course', newCourse, config)
      .then(res => {
        res.config.success(res);
      })
      .catch(err => {
        if(err.response.status !== 401){
          err.config.error(err);
        }
      });
  };

  render(){
    return(
      <div style={{maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', marginTop: '30px'}}>
        {this.state.msg ? <Alert style={{marginBottom: '10px'}} icon={false} severity={this.state.msgType}>{this.state.msg}</Alert> : null}
        <FormControl component="fieldset">
          <RadioGroup row name="course" value={this.state.course} onClick={this.onChange}>
            <FormControlLabel
              value='presence'
              control={<Radio color="primary" />}
              label="Präsenzkurs"
              labelPlacement="start"
            />
            <FormControlLabel
              value='online'
              control={<Radio color="primary" />}
              label="Online-Kurs"
              labelPlacement="start"
            />
          </RadioGroup>
        </FormControl>
        <Grid container direction="row" spacing={1}>
          <Grid item xs={6}>
            {this.state.url ?
              <Avatar src={this.state.url} style={{width: '200px', height: '200px'}}/>
            : <Avatar style={{width: '200px', height: '200px'}}></Avatar>
            }
          </Grid>
          <Grid item xs={6}>
            <input
              style={{display: 'none'}}
              accept="image/*"
              onChange={this.onFileChange}
              name="picture"
              type="file"
              ref={fileInput => this.fileInput = fileInput}
            />
            <Button color="primary" variant='contained' onClick={() => this.fileInput.click()}>Bild auswählen</Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              style={{marginBottom: '10px'}}
              variant='outlined'
              type='text'
              label='Name'
              name='name'
              value={this.state.name}
              onChange={this.onChange}
              fullWidth={true}
            />
            <TextField
              style={{marginBottom: '10px'}}
              variant='outlined'
              type='text'
              label='Kursanbieter'
              name='courseprovider'
              value={this.state.courseprovider}
              onChange={this.onChange}
              fullWidth={true}
            />
          </Grid>
          {this.state.course !== 'online' ?
            <Grid item xs={12} md={6}>
              <TextField
                variant='outlined'
                type='text'
                label='Adresse'
                name='address'
                value={this.state.address}
                onChange={this.onChange}
                onBlur={this.onChangeAddress}
                fullWidth={true}
              />
              <List style={{paddingTop: 0, paddingBottom: '10px'}}>
              {this.state.addresses.map((address, i) => (
                address === 'Keine Übereinstimmung gefunden.' ?
                  <ListItem button key={i} onClick={this.deleteAddress} style={{border: '1px solid rgba(0, 0, 0, 0.23)', borderRadius: '4px'}}>
                    <ListItemText>{address}</ListItemText>
                  </ListItem>
                :
                <ListItem button key={i} onClick={() => {this.setAddress(address)}} style={{border: '1px solid rgba(0, 0, 0, 0.23)', borderRadius: '4px'}}>
                  <ListItemText>{address.display_name}</ListItemText>
                </ListItem>
              ))}
              </List>
              <TextField
                style={{marginBottom: '10px'}}
                variant='outlined'
                type='text'
                label='Postleitzahl'
                name='postalcode'
                value={this.state.postalcode}
                onChange={this.onChange}
                fullWidth={true}
              />
            </Grid>
          : null}
          <Grid item xs={12} md={6}>
            <TextField
              style={{marginBottom: '10px'}}
              variant='outlined'
              label="Stadtdatum"
              type="date"
              name="startdate"
              value={moment(this.state.startdate).format('YYYY-MM-DD')}
              onChange={this.onChange}
              InputLabelProps={{
                shrink: true
              }}
              fullWidth={true}
            />
            <TextField
              style={{marginBottom: '10px'}}
              variant='outlined'
              label="Enddatum"
              type="date"
              name="enddate"
              value={moment(this.state.enddate).format('YYYY-MM-DD')}
              onChange={this.onChange}
              InputLabelProps={{
                shrink: true
              }}
              fullWidth={true}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              style={{marginBottom: '10px'}}
              variant='outlined'
              type='text'
              label='Thema'
              name='topic'
              value={this.state.topic}
              onChange={this.onChange}
              fullWidth={true}
            />
            <TextField
              style={{marginBottom: '10px'}}
              variant='outlined'
              type='text'
              label='Beschreibung'
              name='description'
              multiline
              value={this.state.description}
              onChange={this.onChange}
              fullWidth={true}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              style={{marginBottom: '10px'}}
              variant='outlined'
              type='text'
              label='Voraussetzungen'
              name='requirements'
              multiline
              value={this.state.requirements}
              onChange={this.onChange}
              fullWidth={true}
            />
            <TextField
              style={{marginBottom: '10px'}}
              variant='outlined'
              type='text'
              label='Kursgröße'
              name='size'
              value={this.state.size}
              onChange={this.onChange}
              fullWidth={true}
            />
          </Grid>
          {this.props.badges.length > 0 ?
            <Grid item xs={12} md={6}>
              <FormControl variant="outlined" fullWidth style={{marginBottom: '10px'}}>
                <InputLabel id="select-localbadge">Lokale Badges</InputLabel>
                <Select
                  labelId="select-localbadge"
                  label="Lokale Badges"
                  name='localbadge'
                  value={this.state.localbadge}
                  onChange={this.onChangeBadge}
                  multiple
                >
                  {this.props.badges.map(badge => (
                    badge.global ? null : <MenuItem key={badge._id} value={badge._id}>{badge.name}</MenuItem>
                  ))}
                </Select>
                <Link color="primary" onClick={() => {this.setState({ open: true });}} style={{cursor: 'pointer'}}>
                  Nicht der richtige Badge dabei?
                  <CreateBadge open={this.state.open}/>
                </Link>
              </FormControl>
              <FormControl variant="outlined" fullWidth style={{marginBottom: '10px'}}>
                <InputLabel id="select-globalbadge">Globale Badges</InputLabel>
                <Select
                  labelId="select-globalbadge"
                  label="Globale Badges"
                  name='globalbadge'
                  value={this.state.globalbadge}
                  onChange={this.onChangeBadge}
                  multiple
                >
                  {this.props.badges.map(badge => (
                    badge.global ? <MenuItem key={badge._id} value={badge._id}>{badge.name}</MenuItem> : null
                  ))}
                </Select>
              </FormControl>
            </Grid>
            : <Link color="primary" onClick={() => {this.setState({ open: true });}} style={{cursor: 'pointer'}}>
              Erstelle den ersten Badge.
              <CreateBadge open={this.state.open}/>
            </Link>
          }
        </Grid>
        <p>
          <Button color="primary" variant='contained' onClick={this.onSubmit} style={{width: '100%'}}>
            Kurs erstellen
          </Button>
        </p>
        <p>
          <Button color="default" variant='contained' onClick={this.onReset} style={{width: '100%'}}>
            Zurücksetzen
          </Button>
        </p>
      </div>
    );
  }
}

CreateCourse.propTypes = {
  user: PropTypes.object.isRequired,
  badges: PropTypes.array.isRequired,
  getBadges: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  user: state.auth.user,
  badges: state.badge.badges
});

export default connect(mapStateToProps, { getBadges })(CreateCourse);
