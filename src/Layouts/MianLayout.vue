<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      app
      v-model="drawer"
      :mini-variant.sync="mini"
      permanent
      clipped
    >
      <v-list dense>
        <!-- User Info -->
        <v-list-item>
          <v-list-item-avatar>
            <v-img src="https://randomuser.me/api/portraits/men/85.jpg" />
          </v-list-item-avatar>
          <v-list-item-content v-if="!mini">
            <v-list-item-title class="text-subtitle-1 font-weight-medium">
              John Leider
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption"
              >Admin</v-list-item-subtitle
            >
          </v-list-item-content>

          <v-spacer></v-spacer>
          <v-btn icon @click.stop="mini = !mini">
            <v-icon>{{
              mini ? "mdi-chevron-right" : "mdi-chevron-left"
            }}</v-icon>
          </v-btn>
        </v-list-item>

        <v-divider class="my-2" />

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
          <v-list-item-content v-if="!mini">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
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
export default {
  data() {
    return {
      drawer: true,
      mini: true,
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
};
</script>

<style scoped>
.v-list-item {
  transition: background-color 0.2s ease;
}
</style>
