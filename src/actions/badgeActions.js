import { GET_BADGES, ADD_BADGE, CHANGE_BADGE, CHANGE_BADGES, BADGES_LOADING, NOMINATE_ISSUER, ACCEPT_MENTOR, DECLINE_MENTOR, DECLINE_ISSUER, REQUEST_BADGE_PERMISSION } from './types';

import axios from 'axios';
import { returnErrors, returnSuccess } from './messageActions'

// get badges from API
export const getBadges = (params) => (dispatch) => {
  dispatch({type: BADGES_LOADING});
  axios.get('/api/v1/badge', {params: params})
    .then(res => {
      dispatch({
        type: GET_BADGES,
        payload: res.data.badges
      });
      dispatch(returnSuccess(res.data.message, res.status, 'GET_BADGES_SUCCESS'));
    })
    .catch(err => {
      if(err.response){
        dispatch(returnErrors(err.response.data.message, err.response.status, 'GET_BADGES_FAIL'));
      }
    });
};


// get badge from UI
export const getBadge = (badge) => (dispatch) => {
  dispatch({
    type: CHANGE_BADGE,
    payload: badge
  });
};

// add badge to API
export const addBadge = (newBadge) => (dispatch, getState) => {
  const config = {
    success: res => {
      var badges = getState().badge.badges;
      var badge = res.data.badge;
      // var user = getState().auth.user;
      // badge.issuer[0] = {_id: user._id, firstname: user.firstname, lastname: user.lastname};
      badges.push(badge);
      dispatch(returnSuccess(res.data.message, res.status, 'ADD_BADGE_SUCCESS'));
      dispatch({
        type: ADD_BADGE,
        payload: badges
      });
    },
    error: err => {
      if(err.response){
        dispatch(returnErrors(err.response.data.message, err.response.status, 'ADD_BADGE_FAIL'));
      }
    }
  };
  axios.post('/api/v1/badge', newBadge, config)
    .then(res => {
      res.config.success(res);
    })
    .catch(err => {
      if(err.response.status !== 401){
        err.config.error(err);
      }
    });
};


// change badge
export const changeBadge = (id, updatedBadge) => (dispatch, getState) => {
  const config = {
    success: res => {
      var badges = getState().badge.badges;
      var badge = res.data.badge;
      // var user = getState().auth.user;
      // badge.issuer[0] = {_id: user._id, firstname: user.firstname, lastname: user.lastname};
      const badgeIndex = badges.map(badge => badge._id).indexOf(id);
      badges[badgeIndex] = badge;
      dispatch(returnSuccess(res.data.message, res.status, 'CHANGE_BADGE_SUCCESS'));
      dispatch({
        type: CHANGE_BADGES,
        payload: badges
      });
      dispatch({
        type: CHANGE_BADGE,
        payload: badge
      });
    },
    error: err => {
      if(err.response){
        dispatch(returnErrors(err.response.data.message, err.response.status, 'CHANGE_BADGE_FAIL'));
      }
    }
  };
  axios.put(`/api/v1/badge/${id}`, updatedBadge, config)
    .then(res => {
      res.config.success(res);
    })
    .catch(err => {
      if(err.response.status !== 401){
        err.config.error(err);
      }
    });
};


// accecpt issuer-request
export const acceptIssuerRequest = (badgeId, userId) => (dispatch, getState) => {
  const config = {
    success: res => {
      var badges = getState().badge.badges;
      const badgeIndex = badges.map(badge => badge._id).indexOf(badgeId);
      badges[badgeIndex].mentor.push(badges[badgeIndex].requestor.filter(user => user._id === userId)[0]);
      badges[badgeIndex].requestor = badges[badgeIndex].requestor.filter(user => user._id !== userId);
      dispatch({
        type: ACCEPT_MENTOR,
        payload: badges
      });
      dispatch(returnSuccess(res.data.message, res.status, 'ACCEPT_MENTOR_SUCCESS'));
    },
    error: err => {
      if(err.response){
        dispatch(returnErrors(err.response.data.message, err.response.status, 'ACCEPT_MENTOR_ERROR'));
      }
    }
  };
  axios.put(`/api/v1/badge/${badgeId}/grant/${userId}`, {}, config)
    .then(res => {
      res.config.success(res);
    })
    .catch(err => {
      if(err.response && err.response.status !== 401){
        err.config.error(err);
      }
    });
};

// decline issuer-request
export const declineIssuerRequest = (badgeId, userId) => (dispatch, getState) => {
  const config = {
    success: res => {
      var badges = getState().badge.badges;
      const badgeIndex = badges.map(badge => badge._id).indexOf(badgeId);
      badges[badgeIndex].mentor = badges[badgeIndex].mentor.filter(user => user._id !== userId);
      dispatch({
        type: DECLINE_MENTOR,
        payload: badges
      });
      dispatch(returnSuccess(res.data.message, res.status, 'DECLINE_MENTOR_SUCCESS'));
    },
    error: err => {
      if(err.response){
        if(err.response.status === 400){
          var badges = getState().badge.badges;
          const badgeIndex = badges.map(badge => badge._id).indexOf(badgeId);
          badges[badgeIndex].request = badges[badgeIndex].request.filter(user => user._id !== userId);
          dispatch({
            type: DECLINE_MENTOR,
            payload: badges
          });
          dispatch(returnSuccess(err.response.data.message, err.response.status, 'DECLINE_MENTOR_SUCCESS'));
        } else {
          dispatch(returnErrors(err.response.data.message, err.response.status, 'DECLINE_MENTOR_ERROR'));
        }
      }
    }
  };
  axios.put(`/api/v1/badge/${badgeId}/revoke/${userId}`, {}, config)
    .then(res => {
      res.config.success(res);
    })
    .catch(err => {
      if(err.response && err.response.status !== 401){
        err.config.error(err);
      }
    });
};


// request badge permission
export const requestBadgePermission = (badgeId) => (dispatch, getState) => {
  const config = {
    success: res => {
      var badges = getState().badge.badges;
      const badgeIndex = badges.map(badge => badge._id).indexOf(badgeId);
      const user = getState().auth.user;
      badges[badgeIndex].requestor.push({_id: user._id, firstname: user.firstname, lastname: user.lastname});
      dispatch({
        type: REQUEST_BADGE_PERMISSION,
        payload: badges
      });
      dispatch(returnSuccess(res.data.message, res.status, 'REQUEST_BADGE_PERMISSION_SUCCESS'));
    },
    error: err => {
      if(err.response){
        dispatch(returnErrors(err.response.data.message, err.response.status, 'REQUEST_BADGE_PERMISSION_ERROR'));
      }
    }
  };
  axios.put(`/api/v1/badge/${badgeId}/request`, {}, config)
    .then(res => {
      res.config.success(res);
    })
    .catch(err => {
      if(err.response && err.response.status !== 401){
        err.config.error(err);
      }
    });
};


// accecpt issuer-request
export const nominateIssuer = (badgeId, userId) => (dispatch, getState) => {
  const config = {
    success: res => {
      var badges = getState().badge.badges;
      const badgeIndex = badges.map(badge => badge._id).indexOf(badgeId);
      badges[badgeIndex].issuer.push(userId);
      badges[badgeIndex].mentor = badges[badgeIndex].mentor.filter(user => user._id !== userId);
      badges[badgeIndex].requestor = badges[badgeIndex].requestor.filter(user => user._id !== userId);
      dispatch({
        type: NOMINATE_ISSUER,
        payload: badges
      });
      dispatch(returnSuccess(res.data.message, res.status, 'NOMINATE_ISSUER_SUCCESS'));
    },
    error: err => {
      if(err.response){
        dispatch(returnErrors(err.response.data.message, err.response.status, 'NOMINATE_ISSUER_ERROR'));
      }
    }
  };
  axios.put(`/api/v1/badge/${badgeId}/issuer/${userId}`, {}, config)
    .then(res => {
      res.config.success(res);
    })
    .catch(err => {
      if(err.response && err.response.status !== 401){
        err.config.error(err);
      }
    });
};
