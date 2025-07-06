// src/router/index.js
import MianLayout from "@/Layouts/MianLayout.vue";
import HomeView from "@/views/HomeView.vue";
import Login from "@/views/Login.vue";
import Vue from "vue";
import Router from "vue-router";
import CustomersList from "@/views/Customers/CustomersList.vue";
import LocationList from "@/views/LocationList.vue";
import VehiclesList from "@/views/Vehicles/VehiclesList.vue";
import CustomerView from "@/views/Customers/CustomerView.vue";
import OrdersTab from "@/views/Customers/CustomerTabs/OrdersTab.vue";
import BookingsList from "@/views/Bookings/BookingsList.vue";
import HelloWorld from "@/components/HelloWorld.vue";
import CreateBooking from "@/views/Bookings/CreateBooking.vue";
import OrdersList from "@/views/Orders/OrdersList.vue";
import VehiclesView from "@/views/Vehicles/VehicleView.vue";
import AddVehicles from "../components/AddVehicles.vue";

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
        { path: "/orders", name: "Order", component: OrdersList },
        { path: "/bookings", name: "Booking", component: BookingsList },
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
      children: [
        { path: "orders", name: "Customer  - Orders", component: OrdersTab },
      ],
    },

    {
      path: "/booking/:booking_id",
      component: () => import("@/views/Bookings/BookingView.vue"),
      children: [
        { path: "", redirect: "overview" },
        {
          path: "overview",
          name: "Booking  - Overview",
          component: () => import("@/views/Bookings/Tabs/OverviewTab.vue"),
        },
        {
          path: "payments",
          name: "Booking  - Payments",
          component: () => import("@/views/Bookings/Tabs/PaymentsTab.vue"),
        },
        {
          path: "images",
          name: "Booking  - Images",
          component: () => import("@/views/Bookings/Tabs/ImagesTab.vue"),
        },
        {
          path: "vehicle",
          name: "Booking  - Vehicle",
          component: () => import("@/views/Bookings/Tabs/VehicleTab.vue"),
        },
        {
          path: "extensions",
          name: "Booking  - Extensions",
          component: () => import("@/views/Bookings/Tabs/ExtensionTab.vue"),
        },
      ],
    },
    {
      path: "/orders/:id",
      component: () => import("@/views/Orders/OrderView.vue"),
      children: [
        {
          path: "",
          name: "Order - Overview",
          component: () => import("@/views/Orders/Tabs/OverviewTab.vue"),
        },
        {
          path: "bookings",
          name: "Order - Bookings",
          component: () => import("@/views/Orders/Tabs/BookingsTab.vue"),
        },
        {
          path: "payments",
          name: "Order - Payments",
          component: () => import("@/views/Orders/Tabs/PaymentsTab.vue"),
        },
      ],
    },
    {
      path: "/add-vehicle",
      name: "Add Vehicle",
      component: AddVehicles,
    },

    // Vehicles view with tabs
    {
      path: "/vehicles/:vehicle_id",
      name: "Vehicle Views",
      redirect: "/vehicles/:vehicle_id/overview",
      component: VehiclesView,
      children: [
        {
          path: "overview",
          name: "Vehicle Detail",
          component: () => import("@/views/Vehicles/VehicleTabs/OverView.vue"),
        },
        {
          path: "trace",
          name: "Vehicle Trace",
          component: () => import("../views/Vehicles/VehicleTabs/TraceTab.vue"),
        },
        {
          path: "bookings",
          name: "Vehicle Bookings",
          component: () =>
            import("../views/Vehicles/VehicleTabs/BookingsTab.vue"),
        },
        {
          path: "settings",
          name: "Vehicle Settings",
          component: () =>
            import("@/views/Vehicles/VehicleTabs/SettingsTab.vue"),
        },
      ],
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
