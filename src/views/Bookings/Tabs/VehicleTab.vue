<template>
  <v-container fluid>
    <v-card class="rounded-lg pa-4" outlined>
      <v-row dense>
        <!-- Left Column: Vehicle Image -->
        <v-col cols="12" md="4" class="d-flex justify-center">
          <v-img
            :src="booking.vehicle_data?.model_data?.image_url || ''"
            class="rounded-lg"
            max-width="300"
            max-height="200"
            contain
          >
            <v-overlay absolute :value="true" color="#00000033"> </v-overlay>
          </v-img>
        </v-col>

        <!-- Right Column: Vehicle Details -->
        <v-col cols="12" md="8">
          <v-row dense>
            <v-col cols="12">
              <h3 class="font-weight-bold text-primary">
                {{ booking.vehicle_data?.model_data?.model_name || "N/A" }}
              </h3>
              <div class="text-subtitle-1 grey--text">
                {{ booking.vehicle_data?.model_data?.make || "N/A" }} —
                {{ booking.vehicle_data?.model_data?.year || "N/A" }}
              </div>
            </v-col>

            <!-- Vehicle Details List -->
            <v-col cols="12">
              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold my-2"
              >
                <span>Registration</span>
                <span>{{
                  booking.vehicle_data?.registration_number || "N/A"
                }}</span>
              </div>

              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold my-2"
              >
                <span>Type</span>
                <span>{{
                  booking.vehicle_data?.model_data?.vehicle_type || "N/A"
                }}</span>
              </div>

              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold my-2"
              >
                <span>Color</span>
                <span>{{ booking.vehicle_data?.color || "N/A" }}</span>
              </div>

              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold my-2"
              >
                <span>Status</span>
                <span>{{ booking.vehicle_data?.status || "N/A" }}</span>
              </div>

              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold my-2"
              >
                <span>Fuel Type</span>
                <span>{{
                  booking.vehicle_data?.model_data?.engine_type || "N/A"
                }}</span>
              </div>

              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold my-2"
              >
                <span>Seat Capacity</span>
                <span>{{
                  booking.vehicle_data?.model_data?.seat_capacity || "N/A"
                }}</span>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
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
