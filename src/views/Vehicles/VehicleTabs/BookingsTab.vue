<template>
  <v-container>
    <v-card outlined class="rounded-lg">
      <!-- Loading Skeleton -->
      <v-skeleton-loader
        v-if="loading"
        type="table"
        class="mx-4 mt-4"
        :loading="loading"
      ></v-skeleton-loader>

      <!-- Table when not loading -->

      <v-simple-table>
        <thead>
          <tr>
            <th class="text-left">Booking ID</th>
            <th class="text-left">Reg. Number</th>
            <th class="text-left">Model</th>
            <th class="text-left">Customer</th>
            <th class="text-left">Status</th>
            <th class="text-left">Created At</th>
            <th class="text-left">Source</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in vehicleBookings" :key="booking.booking_id">
            <td>{{ booking.booking_id }}</td>
            <td>{{ vehicle.registration_number }}</td>
            <td>{{ vehicle.model_data?.model_name }}</td>
            <td>
              {{ booking.order_data?.customer_data?.user_data?.name || "N/A" }}
            </td>
            <td>
              <v-chip
                small
                :color="getStatusColor(booking.status)"
                text-color="white"
              >
                {{ booking.status }}
              </v-chip>
            </td>
            <td>{{ formatDate(booking.created_at) }}</td>
            <td>{{ booking.source_type || "N/A" }}</td>
          </tr>
          <tr v-if="!vehicleBookings.length">
            <td colspan="8" class="text-center grey--text">
              No bookings found.
            </td>
          </tr>
        </tbody>
      </v-simple-table>

      <v-divider></v-divider>

      <!-- Pagination Placeholder -->
      <v-card-actions class="justify-center">
        <v-pagination
          v-model="page"
          :length="pageCount"
          circle
          total-visible="5"
          @input="fetchBookings"
        />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import HTTP from "@/plugins/axios";
import Swal from "sweetalert2";
import moment from "moment";

export default {
  name: "BookingsTab",
  data() {
    return {
      loading: true,
      vehicle: null,
      vehicleBookings: [],
      page: 1,
      limit: 10,
      pageCount: 1,
      vehicle_id: this.$route.params.vehicle_id,
    };
  },
  created() {
    this.fetchBookings();
  },
  methods: {
    async fetchBookings() {
      this.loading = true;
      try {
        const { data } = await HTTP.get(
          `/api/vehicle/${this.vehicle_id}/bookings`,
          {
            params: {
              limit: this.limit,
              offset: (this.page - 1) * this.limit,
              vehicle_id: this.vehicle_id,
            },
          }
        );

        const result = data.data.data;
        this.vehicle = result.vehicle;
        this.vehicleBookings = result.bookings;
        this.pageCount = Math.ceil(data.data.meta.total / this.limit);
      } catch (err) {
        console.error("Error loading vehicle:", err);
        Swal.fire({
          title: "Error",
          text: "Failed to load vehicle bookings",
          icon: "error",
        });
      } finally {
        this.loading = false;
      }
    },
    getStatusColor(status) {
      switch (status?.toLowerCase()) {
        case "upcoming":
          return "blue";
        case "completed":
          return "green";
        case "cancelled":
          return "red";
        default:
          return "grey";
      }
    },
    formatDate(date) {
      return moment(date).format("DD MMM YYYY, hh:mm A");
    },
    viewBooking(bookingId) {
      console.log("Viewing booking:", bookingId);
      // You can route to a detailed booking page or open a dialog
    },
  },
};
</script>
