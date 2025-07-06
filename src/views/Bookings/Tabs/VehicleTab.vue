<template>
  <div
    class="pa-4"
    v-if="booking && booking.vehicle_data && booking.vehicle_data.model_data"
  >
    <v-row dense>
      <!-- LEFT COLUMN -->
      <v-col cols="12" sm="4">
        <div><strong>Registration</strong></div>
        <div class="mb-3">
          {{ booking.vehicle_data.registration_number || "N/A" }}
        </div>

        <div><strong>Type</strong></div>
        <div class="mb-3">{{ booking.vehicle_data.vehicle_type || "N/A" }}</div>

        <div><strong>Color</strong></div>
        <div class="mb-3">{{ booking.vehicle_data.color || "N/A" }}</div>

        <div><strong>Current Status</strong></div>
        <div class="mb-3">{{ booking.vehicle_data.status || "N/A" }}</div>
      </v-col>

      <!-- RIGHT COLUMN -->
      <v-col cols="12" sm="4">
        <div><strong>Model</strong></div>
        <div class="mb-3">
          {{ booking.vehicle_data.model_data.model_name || "N/A" }}
        </div>

        <div><strong>Brand</strong></div>
        <div class="mb-3">
          {{ booking.vehicle_data.model_data.make || "N/A" }}
        </div>

        <div><strong>Fuel Type</strong></div>
        <div class="mb-3">
          {{ booking.vehicle_data.model_data.fuel_type || "N/A" }}
        </div>

        <div><strong>Year</strong></div>
        <div class="mb-3">
          {{ booking.vehicle_data.model_data.year || "N/A" }}
        </div>

        <div><strong>Engine Capacity</strong></div>
        <div class="mb-3">
          {{
            booking.vehicle_data.model_data.engine_capacity ||
            booking.vehicle_data.model_data.engine_type ||
            "N/A"
          }}
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "VehicleTab",
  props: {
    booking: {
      type: Object,
      required: true,
    },
  },
};
</script>
