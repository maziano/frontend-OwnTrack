import Vue from "vue";
import Vuex from "vuex";
import config from "@/config";

Vue.use(Vuex);

// Define initial map state with all required properties
const initialMapState = {
  center: [0, 0],
  zoom: 13,
  layers: {
    heatmap: false,
    last: true,
    line: true,
    poi: true,
    points: false
  }
};

// Export initialMapState so it can be used in mutations
export { initialMapState };

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',  // Add strict mode for development
  state: {
    map: initialMapState,  // Initialize map state first
    isLoading: false,
    frontendVersion: import.meta.env.PACKAGE_VERSION,
    recorderVersion: "",
    users: [],
    devices: {},
    lastLocations: [],
    locationHistory: {},
    selectedUser: null,
    selectedDevice: null,
    startDateTime: new Date().toISOString().slice(0, 19),
    endDateTime: new Date().toISOString().slice(0, 19),
    distanceTravelled: 0,
    elevationGain: 0,
    elevationLoss: 0,
    requestAbortController: null,
  },

  // Add state initialization plugin
  plugins: [
    store => {
      store.subscribe((mutation, state) => {
        // Ensure map state exists after every mutation
        if (!state.map) {
          console.warn('Map state was undefined, reinitializing...');
          store.commit('INITIALIZE_MAP_STATE');
        }
      })
    }
  ],

  mutations: {
    // Add initialization mutation
    INITIALIZE_MAP_STATE(state) {
      Vue.set(state, 'map', {
        ...initialMapState
      });
    },
  },
  
  getters,
  actions
});

// Initialize map state immediately
store.commit('INITIALIZE_MAP_STATE');

// Add debug logging in development
if (process.env.NODE_ENV !== 'production') {
  store.subscribe((mutation, state) => {
    console.log('Mutation:', mutation.type, mutation.payload);
    console.log('State after mutation:', {
      ...state,
      map: state.map ? { ...state.map } : null
    });
  });
}

export default store;
