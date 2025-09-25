<template>
  <v-menu v-model="menu" :close-on-content-click="false" bottom offset-y>
    <template v-slot:activator="{ on, attrs }">
      <span
        class="indigo--text font-weight-medium"
        style="cursor: pointer"
        v-bind="attrs"
        v-on="on"
      >
        {{ location?.name }}
      </span>
    </template>

    <v-card max-width="450" class="pa-3">
      <div>
        <div class="text-subtitle-1 font-weight-bold">{{ location?.name }}</div>
        <div class="text-subtitle-2 secondary--text">
          {{ location?.address }}
        </div>
      </div>

      <v-divider class="my-2" />

      <div class="text-body-2 mt-4">
        <v-row dense>
          <v-col cols="6">
            City: <strong>{{ location?.city_data?.city_name }}</strong>
          </v-col>

          <v-col cols="6">
            Postal Code: <strong>{{ location?.postal_code }}</strong>
          </v-col>
          <v-col cols="6">
            Latitude: <strong>{{ location?.latitude }}</strong>
          </v-col>

          <v-col cols="6">
            Longitude: <strong>{{ location?.longitude }}</strong>
          </v-col>
          <v-col cols="6">
            Pickup:
            <strong
              >{{ location?.pickup_start_time }} -
              {{ location?.pickup_end_time }}</strong
            >
          </v-col>

          <v-col cols="6">
            Drop:
            <strong
              >{{ location?.drop_start_time }} -
              {{ location?.drop_end_time }}</strong
            >
          </v-col>
          <v-col cols="6">
            Service:
            <strong
              >{{ location?.service_start_time }} -
              {{ location?.service_end_time }}</strong
            >
          </v-col>

          <v-col cols="6">
            Service Days: <strong>{{ location?.service_days }}</strong>
          </v-col>
          <v-col cols="6">
            Contact: <strong>{{ location?.contact_number }}</strong>
          </v-col>
          <v-col cols="6">
            Status:
            <v-chip
              outlined
              small
              :color="location?.is_active ? 'green' : 'red'"
              dark
            >
              <strong>{{ location?.is_active ? "Active" : "Inactive" }}</strong>
            </v-chip>
          </v-col>

          <v-col cols="12" v-if="location?.notes">
            Notes: <strong>{{ location?.notes }}</strong>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  name: "LocationViewer",
  props: {
    location: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      menu: false,
    };
  },
};
</script>
