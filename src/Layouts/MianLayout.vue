<template>
  <v-app>
    <!-- =========================
         App Bar
    ========================== -->
    <v-app-bar
      app
      color="#F5F5F5"
      dark
      :clipped-left="$vuetify.breakpoint.mdAndUp"
      elevation="0"
    >
      <!-- Drawer Toggle -->
      <v-app-bar-nav-icon
        aria-label="Toggle navigation menu"
        @click="toggleDrawer"
        color="black"
      />

      <!-- Brand Name -->
      <v-toolbar-title class="text-h6 black--text font-weight-medium">
        Ontrack Daily Ops
      </v-toolbar-title>

      <v-spacer />

      <!-- Quick Action: Add Booking -->
      <v-btn
        class="text-none mr-2 d-none d-md-flex"
        rounded
        outlined
        color="primary"
        depressed
        :to="{ path: '/create-booking' }"
      >
        <v-icon left>mdi-plus</v-icon>
        Add Booking
      </v-btn>

      <!-- User Menu -->
      <v-menu offset-y left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            rounded
            depressed
            text
            color="black"
            v-bind="attrs"
            v-on="on"
            class="text-capitalize"
          >
            <v-avatar size="28" class="mr-2">
              <v-img :src="avatarSrc" alt="User avatar" contain />
            </v-avatar>
            <span class="d-none d-sm-inline">
              {{ user.name || "Loading..." }}
            </span>
            <v-icon right>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <!-- User Dropdown Card -->
        <v-card max-width="320">
          <v-list-item>
            <v-list-item-avatar>
              <v-img :src="avatarSrc" alt="User avatar" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="font-weight-medium">
                {{ user.name || "—" }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ user.email || "—" }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-divider />

          <!-- Settings Toggles -->
          <v-list dense>
            <v-list-item @click="message = !message">
              <v-list-item-action>
                <v-switch v-model="message" color="primary" />
              </v-list-item-action>
              <v-list-item-title>Enable messages</v-list-item-title>
            </v-list-item>

            <v-list-item @click="hints = !hints">
              <v-list-item-action>
                <v-switch v-model="hints" color="primary" />
              </v-list-item-action>
              <v-list-item-title>Enable hints</v-list-item-title>
            </v-list-item>
          </v-list>

          <v-divider class="my-2" />

          <!-- Logout -->
          <v-card-actions>
            <v-btn text color="error" block @click="logout"> Logout </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- =========================
         Navigation Drawer
    ========================== -->
    <v-navigation-drawer
      app
      v-model="drawer"
      :mini-variant="!isMobile && mini"
      :expand-on-hover="!isMobile && mini"
      :temporary="isMobile"
      :clipped="$vuetify.breakpoint.mdAndUp"
    >
      <!-- Main Nav Items -->
      <v-list dense nav>
        <template v-for="item in items">
          <!-- Group with children -->
          <v-list-group
            v-if="item.children"
            :key="`group-${item.title}`"
            :prepend-icon="item.icon"
            no-action
            :value="isGroupActive(item)"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item-content>
            </template>

            <!-- Group Children -->
            <v-list-item
              v-for="child in item.children"
              :key="`child-${child.title}`"
              :to="child.route"
              router
              exact
              active-class="primary--text text--accent-4 font-weight-bold"
            >
              <v-list-item-icon v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ child.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>

          <!-- Single item -->
          <v-list-item
            v-else
            :key="`single-${item.title}`"
            :to="item.route"
            router
            exact
            active-class="primary--text text--accent-4 font-weight-bold"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="font-weight-medium">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
      <v-divider class="my-2" />

      <!-- Mini-variant Toggle (desktop only) -->
      <v-list dense v-if="!isMobile">
        <v-list-item @click="mini = !mini">
          <v-list-item-icon>
            <v-icon>
              {{
                mini ? "mdi-chevron-double-right" : "mdi-chevron-double-left"
              }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-title>
            {{ mini ? "Expand menu" : "Collapse menu" }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- =========================
         Main Content
    ========================== -->
    <v-main>
      <!-- Global Loading Bar -->
      <v-progress-linear
        v-if="loadingUser"
        color="primary"
        height="2"
        indeterminate
      />

      <v-container fluid class="py-4">
        <!-- Skeleton while loading user -->
        <div v-if="loadingUser" class="mb-4">
          <v-skeleton-loader type="article" class="mb-3" />
          <v-skeleton-loader type="list-item-two-line" />
        </div>

        <!-- Routed Content -->
        <router-view />
      </v-container>
    </v-main>

    <!-- =========================
         Footer
    ========================== -->
    <v-footer app padless>
      <v-col class="text-center py-2" cols="12">
        © {{ currentYear }} — <strong>Ontrack</strong>
      </v-col>
    </v-footer>

    <!-- =========================
         Global Error Snackbar
    ========================== -->
    <v-snackbar v-model="error.show" color="error" timeout="4000" top right>
      {{ error.message }}
      <v-btn text @click="error.show = false">Dismiss</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import api, { setAuthToken } from "@/plugins/axios";

export default {
  name: "MainLayout",
  data() {
    return {
      drawer: true,
      mini: true,

      loadingUser: false,
      user: { name: "", email: "" },
      message: true,
      hints: true,
      error: { show: false, message: "" },
      // Navigation Items
      items: [
        { title: "Dashboard", icon: "mdi-view-dashboard", route: "/" },
        { title: "Orders", icon: "mdi-receipt", route: "/orders" },
        {
          title: "Bookings",
          icon: "mdi-calendar-check",
          route: "/bookings",
          children: [
            { title: "All", route: "/bookings/" },
            { title: "Created", route: "/bookings/created" },
            { title: "Active", route: "/bookings/active" },
            { title: "Upcoming", route: "/bookings/upcoming" },
            { title: "Cancelled", route: "/bookings/cancelled" },
            { title: "Completed", route: "/bookings/completed" },
          ],
        },
        { title: "Vehicles", icon: "mdi-motorbike", route: "/vehicles" },
        { title: "Customers", icon: "mdi-account-group", route: "/customers" },
        { title: "Locations", icon: "mdi-map-marker", route: "/locations" },
        { title: "Models", icon: "mdi-bike", route: "/models" },
        { title: "Add-Ons", icon: "mdi-plus-box", route: "/add-ons" },
      ],
    };
  },
  computed: {
    // Detect mobile breakpoint
    isMobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },
    // Current year for footer
    currentYear() {
      return new Date().getFullYear();
    },
    // Placeholder avatar
    avatarSrc() {
      return "https://cdn.vuetifyjs.com/images/john.jpg";
    },
  },
  watch: {
    // Adjust drawer on breakpoint change
    isMobile: {
      immediate: true,
      handler(val) {
        this.drawer = !val;
        this.mini = !val;
      },
    },
  },
  created() {
    this.fetchUser();
  },
  methods: {
    // Toggle drawer manually
    toggleDrawer() {
      this.drawer = !this.drawer;
    },
    // Highlight correct group menu
    isGroupActive(group) {
      if (!group || !group.route) return false;
      const base = group.route.replace(/\/$/, "");
      return this.$route.path.startsWith(base);
    },
    // Fetch logged-in user details
    async fetchUser() {
      try {
        this.loadingUser = true;
        const res = await api.get("/api/provider/me");
        if (res.data?.data) {
          const { name, contact_email } = res.data.data;
          this.user.name = name || "";
          this.user.email = contact_email || "";
        }
      } catch (err) {
        console.error("Failed to fetch user info:", err?.message || err);
        this.error.message = "Failed to load user information.";
        this.error.show = true;
        if (err?.response?.status === 401) {
          this.handleLogout();
        }
      } finally {
        this.loadingUser = false;
      }
    },
    logout() {
      localStorage.removeItem("authToken");
      setAuthToken(null);
      this.$router.replace("/login");
    },
  },
};
</script>
