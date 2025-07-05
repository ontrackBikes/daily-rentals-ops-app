import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import { setAuthToken } from "./plugins/axios";
import moment from "moment";
import Swal from "sweetalert2";

import * as VueGoogleMaps from "vue2-google-maps";

Vue.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyDucvvoh1OTE5cVUjLLL2lFoXBqTsdVQNo",
    libraries: "places",
  },
});

Vue.config.productionTip = false;

const token = localStorage.getItem("authToken");
if (token) {
  setAuthToken(token);
}

Vue.filter("moment", function (value) {
  if (!value) return "";
  return moment(value).format("DD MMM YYYY, hh:mm A");
});

Vue.prototype.$swal = Swal;

new Vue({
  vuetify,
  router,
  render: (h) => h(App),
}).$mount("#app");
