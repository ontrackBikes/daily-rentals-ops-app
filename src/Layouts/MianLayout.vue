<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer app v-model="drawer" permanent clipped>
      <v-list dense>
        <!-- Navigation Items -->
        <v-list-item
          v-for="item in items"
          :key="item.title"
          :to="item.route"
          router
          exact
          active-class="deep-purple--text text--accent-4 font-weight-bold"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <!-- Top-right User Menu -->
        <div class="d-flex justify-end mb-4">
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                text
                color="primary"
                v-bind="attrs"
                v-on="on"
                class="text-capitalize"
              >
                {{ user.name || "Loading..." }}
                <v-icon right>mdi-chevron-down</v-icon>
              </v-btn>
            </template>

            <v-card width="300">
              <v-list-item>
                <v-list-item-avatar>
                  <v-img
                    src="https://cdn.vuetifyjs.com/images/john.jpg"
                    alt="User Avatar"
                  />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ user.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-divider></v-divider>

              <v-list dense>
                <v-list-item>
                  <v-list-item-action>
                    <v-switch v-model="message" color="purple" />
                  </v-list-item-action>
                  <v-list-item-title>Enable messages</v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action>
                    <v-switch v-model="hints" color="purple" />
                  </v-list-item-action>
                  <v-list-item-title>Enable hints</v-list-item-title>
                </v-list-item>
              </v-list>

              <v-divider class="my-2" />

              <v-card-actions>
                <v-btn block text color="error" @click="logout"> Logout </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </div>

        <!-- Routed Content -->
        <router-view />
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer app padless>
      <v-col class="text-center py-2" cols="12">
        © {{ new Date().getFullYear() }} — <strong>Ontrack</strong>
      </v-col>
    </v-footer>
  </v-app>
</template>
<script>
import api, { setAuthToken } from "@/plugins/axios";

export default {
  data() {
    return {
      drawer: true,
      mini: true,
      user: {
        name: "",
        email: "",
      },
      message: true,
      hints: true,
      items: [
        { title: "Dashboard", icon: "mdi-view-dashboard", route: "/" },
        { title: "Orders", icon: "mdi-receipt", route: "/orders" },
        { title: "Bookings", icon: "mdi-calendar-check", route: "/bookings" },
        { title: "Vehicles", icon: "mdi-motorbike", route: "/vehicles" },
        { title: "Customers", icon: "mdi-account-group", route: "/customers" },
        { title: "Locations", icon: "mdi-map-marker", route: "/locations" },
      ],
    };
  },
  created() {
    this.fetchUser();
  },
  methods: {
    async fetchUser() {
      try {
        const res = await api.get("/api/provider/me");
        if (res.data?.data) {
          const { name, contact_email } = res.data.data;
          this.user.name = name;
          this.user.email = contact_email;
        }
      } catch (err) {
        console.error("Failed to fetch user info", err);
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
