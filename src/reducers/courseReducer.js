import { COURSE_LOADED, COURSE_LOADING, SET_COURSE_PARAMS, COURSE_ERROR } from '../actions/types';


const initialState = {
  courses: null,
  isLoading: false,
  params: {
    type: '',
    online: false,
    name: '',
    topic: '',
    coordinates: null,
    radius: 15,
    startdate: null,
    enddate: null,
    parameter: 0,
    addresses: [],
    address: ''
  }
};

export default function(state = initialState, action){
  switch(action.type){
    case COURSE_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case COURSE_LOADED:
      return {
        ...state,
        isLoading: false,
        courses: action.payload
      };
    case COURSE_ERROR:
      return {
        ...state,
        courses: null,
        isLoading: false
      };
    case SET_COURSE_PARAMS:
      return {
        ...state,
        params: action.payload
      };
    default:
      return state;
  }
}
