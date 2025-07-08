<template>
  <v-menu v-model="menu" :open-on-hover="true" bottom offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn text color="primary" dark v-bind="attrs" v-on="on">
        <slot></slot>
      </v-btn>
    </template>

    <v-card max-width="400" class="pa-3">
      <v-list-item>
        <v-list-item-avatar tile size="60">
          <v-img :src="vehicle?.image_url" v-if="vehicle?.image_url" />
          <v-icon v-else>mdi-motorbike</v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="text-subtitle-1 font-weight-medium">
            {{ vehicle?.registration_number }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ vehicle?.vehicle_type }} • {{ vehicle?.status }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider class="my-2" />

      <div class="text-body-2">
        <div><strong>Chassis:</strong> {{ vehicle?.chassis_number }}</div>
        <div><strong>Engine:</strong> {{ vehicle?.engine_number }}</div>
        <div><strong>Current KM:</strong> {{ vehicle?.current_km }} km</div>
        <div>
          <strong>Next Service:</strong> {{ vehicle?.next_service_date }}
        </div>
        <div v-if="vehicle?.location_data">
          <strong>Location:</strong> {{ vehicle?.location_data.name }}
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  name: "VehicleViewer",
  props: {
    vehicle: {
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
