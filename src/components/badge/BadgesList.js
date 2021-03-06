import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getBadges, clearParams } from '../../actions/badgeActions';

import Badges from './Badges';
import CreateBadge from './CreateBadge';
import BadgeFilter from './BadgeFilter';

import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

export class BadgesList extends Component {

  state = {
    open: false,
    msg: null,
    msgType: null
  }

  componentDidMount(){
    this.props.clearParams();
    this.props.getBadges(this.props.url);
  }

  componentDidUpdate(previousProps, previousState) {
    if(previousState.open === true){
      this.setState({ open: false });
    }
    const { message } = this.props;
    if (message !== previousProps.message) {
      // Check for error
      if(message.id === 'GET_BADGES_FAIL'){
        this.setState({msg: message.msg, msgType: 'error'});
      }
      else {
        this.setState({msg: null});
      }
    }
  }

  render(){
    return(
      <div>
        {this.props.isLoading ?
          <div>
            <LinearProgress />
            {this.props.isAuthenticated && this.props.create ?
              <div style={{maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto', marginTop: '30px'}}>
                <Button variant="contained" color="primary" onClick={() => this.setState({ open: true })} style={{marginBottom: '30px'}}>
                  Neuer Badge
                  <CreateBadge open={this.state.open}/>
                </Button>
              </div>
            : null}
          </div>
        :
          <div style={{maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto', marginTop: '30px'}}>
            {this.state.msg ? <Alert style={{marginBottom: '10px'}} icon={false} severity={this.state.msgType}>{this.state.msg}</Alert> : null}
            {this.props.isAuthenticated && this.props.create ?
              <Button variant="contained" color="primary" onClick={() => this.setState({ open: true })} style={{marginBottom: '30px'}}>
                Neuer Badge
                <CreateBadge open={this.state.open}/>
              </Button>
            : null}
            <BadgeFilter url={this.props.url}/>
            {!this.props.isLoading && this.props.badges ?
              <Badges badges={this.props.badges} settings/>
            : null}
          </div>
        }
        </div>
    );
  }
}

BadgesList.propTypes = {
  badges: PropTypes.array.isRequired,
  message: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  getBadges: PropTypes.func.isRequired,
  clearParams: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  badges: state.badge.badges,
  isLoading: state.badge.isLoading,
  message: state.message,
  isAuthenticated: state.auth.isAuthenticated,
});


export default connect(mapStateToProps, { getBadges, clearParams })(BadgesList);
