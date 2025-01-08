import Vue from "vue";
import VueModal from "vue-js-modal";
import VueOutsideEvents from "vue-outside-events";
import VueMq from "vue-mq";

import App from "@/App.vue";
import config from "@/config";
import { log } from "@/logging";
import i18n from "@/i18n";
import router from "@/router";
import store from "@/store";

Vue.use(VueModal);
Vue.use(VueOutsideEvents);
Vue.use(VueMq, {
  breakpoints: {
    sm: 1300,
    lg: Infinity,
  },
});

Vue.config.productionTip = false;

log("CONFIG", config);

Vue.prototype.$config = config;

Vue.config.errorHandler = function(err, vm, info) {
  console.error('Vue Error:', err);
  console.log('Component:', vm);
  console.log('Error Info:', info);
};

Vue.config.warnHandler = function(msg, vm, trace) {
  console.warn('Vue Warning:', msg);
  console.log('Component:', vm);
  console.log('Trace:', trace);
};

const initApp = () => {
  new Vue({
    i18n,
    router,
    store,
    render: h => h(App)
  }).$mount("#app");
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
