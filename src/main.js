import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import { setAuthToken } from "./plugins/axios";

Vue.config.productionTip = false;

const token = localStorage.getItem("authToken");
if (token) {
  setAuthToken(token);
}

new Vue({
  vuetify,
  router,
  render: (h) => h(App),
}).$mount("#app");
