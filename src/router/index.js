// src/router/index.js
import MianLayout from "@/Layouts/MianLayout.vue";
import HomeView from "@/views/HomeView.vue";
import Login from "@/views/Login.vue";
import Orders from "@/views/Orders.vue";
import Vue from "vue";
import Router from "vue-router";
import CustomersList from "@/views/Customers/CustomersList.vue";
import LocationList from "@/views/LocationList.vue";
import VehiclesList from "@/views/Vehicles/VehiclesList.vue";

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "/",
      name: "Main Layout",
      component: MianLayout,
      children: [
        { path: "/", name: "Home", component: HomeView },
        { path: "/orders", name: "Order", component: Orders },
        { path: "/vehicles", name: "Vehicle", component: VehiclesList },
        { path: "/customers", name: "Customer", component: CustomersList },
        { path: "/locations", name: "Location", component: LocationList },
      ],
    },
    { path: "/login", name: "Login", component: Login },
  ],
});

// ✅ Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("authToken");
  if (!token && to.path !== "/login") {
    next("/login");
  } else if (token && to.path === "/login") {
    next("/");
  } else {
    next();
  }
});

export default router;
