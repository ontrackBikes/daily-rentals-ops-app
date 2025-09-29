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
import ModelsList from "@/views/Models/ModelsList.vue";
import ModelView from "@/views/Models/ModelView.vue";
import SelectSubscription from "@/views/Bookings/SelectSubscription.vue";
import SelectModels from "@/views/Bookings/SelectModels.vue";
import CustomerDetails from "@/views/Bookings/CustomerDetails.vue";

Vue.use(Router);

const router = new Router({
  routes: [
    { path: "/hello-world", name: "Login", component: HelloWorld },
    {
      path: "/create",
      name: "Create Booking",
      component: CreateBooking,
    },

    {
      path: "/create-booking",
      name: "Select Models",
      component: SelectModels,
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
        { path: "/models", name: "Model", component: ModelsList },
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
      redirect: "/orders/:id/bookings",
      children: [
        // {
        //   path: "",
        //   name: "Order - Overview",
        //   component: () => import("@/views/Orders/Tabs/OverviewTab.vue"),
        // },
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
        {
          path: "payments-links",
          name: "Order - Payment Links",
          component: () => import("@/views/Orders/Tabs/PaymentLinksTab.vue"),
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

      component: VehiclesView,
      children: [
        { path: "", redirect: "overview" },
        {
          path: "overview",
          name: "Vehicle - Overview",
          component: () => import("@/views/Vehicles/VehicleTabs/OverView.vue"),
        },
        {
          path: "trace",
          name: "Vehicle - Trace",
          component: () => import("../views/Vehicles/VehicleTabs/TraceTab.vue"),
        },
        {
          path: "bookings",
          name: "Vehicle - Bookings",
          component: () =>
            import("../views/Vehicles/VehicleTabs/BookingsTab.vue"),
        },
        {
          path: "settings",
          name: "Vehicle - Settings",
          component: () =>
            import("@/views/Vehicles/VehicleTabs/SettingsTab.vue"),
        },
      ],
    },
    // Model view with tabs
    {
      path: "/models/:model_id",
      name: "Model View",
      component: ModelView,
    },
    {
      path: "/select-subscription/:model_id",
      name: "Select Subscription",
      component: SelectSubscription,
    },
    {
      path: "/customer-details",
      name: "Customer Details",
      component: CustomerDetails,
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
