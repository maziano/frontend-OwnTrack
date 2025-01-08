import * as types from "@/store/mutation-types";

export default {
  [types.SET_IS_LOADING](state, isLoading) {
    state.isLoading = isLoading;
  },
  [types.SET_RECORDER_VERSION](state, version) {
    state.recorderVersion = version;
  },
  [types.SET_USERS](state, users) {
    state.users = users;
  },
  [types.SET_DEVICES](state, devices) {
    state.devices = devices;
  },
  [types.SET_LAST_LOCATIONS](state, lastLocations) {
    state.lastLocations = Array.isArray(lastLocations) ? lastLocations : [];
  },
  [types.SET_LOCATION_HISTORY](state, locationHistory) {
    state.locationHistory = locationHistory;
  },
  [types.SET_SELECTED_USER](state, selectedUser) {
    state.selectedUser = selectedUser;
  },
  [types.SET_SELECTED_DEVICE](state, selectedDevice) {
    state.selectedDevice = selectedDevice;
  },
  [types.SET_START_DATE_TIME](state, startDateTime) {
    state.startDateTime = startDateTime;
  },
  [types.SET_END_DATE_TIME](state, endDateTime) {
    state.endDateTime = endDateTime;
  },
  [types.SET_MAP_CENTER](state, center) {
    if (!state.map) {
      state.map = { ...initialMapState };
    }
    
    if (Array.isArray(center)) {
      state.map.center = center;
    } else if (center?.lat !== undefined && center?.lng !== undefined) {
      state.map.center = [center.lat, center.lng];
    } else {
      console.warn('Invalid center format:', center);
      state.map.center = [0, 0];
    }
  },
  [types.SET_MAP_ZOOM](state, zoom) {
    if (!state.map) {
      state.map = { ...initialMapState };
    }
    state.map.zoom = Number(zoom) || 13;
  },
  [types.SET_MAP_LAYER_VISIBILITY](state, { layer, visibility }) {
    if (!state.map?.layers) {
      state.map = { ...initialMapState };
    }
    Vue.set(state.map.layers, layer, Boolean(visibility));
  },
  [types.SET_DISTANCE_TRAVELLED](state, distanceTravelled) {
    state.distanceTravelled = distanceTravelled;
  },
  [types.SET_ELEVATION_GAIN](state, elevationGain) {
    state.elevationGain = elevationGain;
  },
  [types.SET_ELEVATION_LOSS](state, elevationLoss) {
    state.elevationLoss = elevationLoss;
  },
  [types.SET_REQUEST_ABORT_CONTROLLER](state, requestAbortController) {
    state.requestAbortController = requestAbortController;
  },
};
