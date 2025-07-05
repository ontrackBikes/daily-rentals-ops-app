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
import CustomerView from "@/views/Customers/CustomerView.vue";
import OrdersTab from "@/views/Customers/CustomerTabs/OrdersTab.vue";
import HelloWorld from "@/components/HelloWorld.vue";
import CreateBooking from "@/views/Bookings/CreateBooking.vue";

Vue.use(Router);

const router = new Router({
  routes: [
    { path: "/hello-world", name: "Login", component: HelloWorld },
    {
      path: "/create-booking",
      name: "Create Booking",
      component: CreateBooking,
    },

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

    {
      path: "/customer/:customer_id",
      name: "Customer View",
      redirect: "/customer/:customer_id/orders",
      component: CustomerView,
      children: [{ path: "orders", name: "Orders", component: OrdersTab }],
    },

    { path: "/login", name: "Login", component: Login },
  ],
  mode: "history",
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
