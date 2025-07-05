<template>
  <v-container fluid class="mt-4">
    <div v-if="vehicle && vehicle.booking_data && vehicle.booking_data.length">
      <v-card elevation="2">
        <v-card-title>
          <v-icon left class="mr-2" color="primary">mdi-calendar-check</v-icon>
          Bookings
        </v-card-title>

        <v-card-text class="pa-0">
          <v-simple-table dense>
            <thead>
              <tr>
                <th class="text-left">Booking ID</th>
                <th class="text-left">Registration Number</th>
                <th class="text-left">Model</th>
                <th class="text-left">Customer</th>
                <th class="text-left">Source</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="booking in vehicle.booking_data"
                :key="booking.booking_id"
              >
                <td>{{ booking.booking_id }}</td>
                <td>{{ vehicle.registration_number }}</td>
                <td>{{ vehicle.model_data?.model_name }}</td>
                <td>
                  {{ booking.order_data.customer_data.first_name }}
                  {{ booking.order_data.customer_data.last_name }}
                </td>
                <td>{{ vehicle.provider_data?.source || "N/A" }}</td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </div>

    <div v-else-if="vehicle" class="text-center my-5">
      <v-icon color="grey" large class="mb-2">mdi-information</v-icon>
      <div class="grey--text">No booking data found for this vehicle.</div>
    </div>
  </v-container>
</template>

<script>
import HTTP from "@/plugins/axios";
import Swal from "sweetalert2";

export default {
  name: "BookingsTab",
  data() {
    return {
      vehicle: null,
      limit: 1,
      offset: 0,
      vehicle_id: this.$route.params.vehicle_id,
    };
  },
  created() {
    this.loadVehicle();
  },
  methods: {
    async loadVehicle() {
      try {
        const { data } = await HTTP.get("/api/vehicles", {
          params: {
            limit: this.limit,
            offset: this.offset,
            vehicle_id: this.vehicle_id,
          },
        });
        this.vehicle = data.data.vehicles;
      } catch (err) {
        console.error("Error loading vehicle:", err);
        Swal.fire({
          title: "Error",
          text: "Failed to load vehicle details",
          icon: "error",
        });
      }
    },
  },
};
</script>
