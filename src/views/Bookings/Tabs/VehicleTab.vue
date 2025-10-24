<template>
  <v-container fluid>
    <v-card outlined class="rounded-lg pa-6">
      <v-row dense>
        <!-- Vehicle Image -->
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

        <!-- Vehicle Details -->
        <v-col cols="12" md="8">
          <div class="mb-4">
            <div class="text-h5 font-weight-bold text-primary mb-1">
              {{ booking.vehicle_data?.model_data?.model_name || "N/A" }}
            </div>
            <div class="text-subtitle-2 grey--text">
              {{ booking.vehicle_data?.model_data?.make || "N/A" }} —
              {{ booking.vehicle_data?.model_data?.year || "N/A" }}
            </div>
          </div>

          <v-divider class="my-3"></v-divider>

          <v-simple-table dense>
            <tbody>
              <tr>
                <td class="font-weight-medium">Registration</td>
                <td>
                  {{ booking.vehicle_data?.registration_number || "N/A" }}
                </td>
              </tr>
              <tr>
                <td class="font-weight-medium">Type</td>
                <td>
                  {{ booking.vehicle_data?.model_data?.vehicle_type || "N/A" }}
                </td>
              </tr>
              <tr>
                <td class="font-weight-medium">Color</td>
                <td>{{ booking.vehicle_data?.color || "N/A" }}</td>
              </tr>
              <tr>
                <td class="font-weight-medium">Status</td>
                <td>{{ booking.vehicle_data?.status || "N/A" }}</td>
              </tr>
              <tr>
                <td class="font-weight-medium">Fuel Type</td>
                <td>
                  {{ booking.vehicle_data?.model_data?.engine_type || "N/A" }}
                </td>
              </tr>
              <tr>
                <td class="font-weight-medium">Seat Capacity</td>
                <td>
                  {{ booking.vehicle_data?.model_data?.seat_capacity || "N/A" }}
                </td>
              </tr>
            </tbody>
          </v-simple-table>
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
