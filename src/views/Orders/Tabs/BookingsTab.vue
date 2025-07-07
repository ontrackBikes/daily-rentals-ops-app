<template>
  <v-card outlined class="rounded-lg my-2">
    <v-simple-table>
      <thead>
        <tr>
          <th>Booking ID</th>
          <th>Regn No</th>
          <!-- <th>Model</th> -->
          <th>Amount</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="loading">
          <td colspan="6" class="text-center py-6">
            <v-progress-circular indeterminate color="primary" />
          </td>
        </tr>

        <tr v-for="(item, index) in bookings" :key="index">
          <td>{{ item.internal_booking_id || "-" }}</td>

          <!-- Regn No -->
          <td>
            <VehicleViewer :vehicle="item.vehicle_data">
              {{ item.vehicle_data?.registration_number || "-" }}
            </VehicleViewer>
          </td>

          <!-- Model -->
          <!-- <td>
            <ModelViewer :model="item.model_data">
              {{ item.model_data?.model_name || "-" }}
            </ModelViewer>
          </td> -->

          <!-- Amount -->
          <td>{{ item.net_amount || "-" }}</td>

          <!-- Status -->
          <td>{{ item.status || "-" }}</td>

          <!-- Action -->
          <td>
            <v-btn
              text
              small
              color="primary"
              @click="goToBookingView(item.booking_id)"
            >
              View
            </v-btn>
          </td>
        </tr>

        <tr v-if="!loading && bookings.length === 0">
          <td colspan="6" class="text-center">No bookings found</td>
        </tr>
      </tbody>
    </v-simple-table>

    <!-- Load More Button -->
    <div class="text-center mt-4">
      <v-btn
        v-if="hasMore"
        :loading="loading"
        color="primary"
        text
        @click="fetchBookings"
      >
        Load More
      </v-btn>
    </div>
  </v-card>
</template>

<script>
// import ModelViewer from "@/components/ModelViewer.vue";
import VehicleViewer from "@/components/VehicleViewer.vue";
import api from "@/plugins/axios";

export default {
  name: "BookingsTab",
  components: {
    VehicleViewer,
    // ModelViewer,
  },
  data() {
    return {
      bookings: [],
      total: 0,
      limit: 10,
      offset: 0,
      loading: false,
    };
  },

  computed: {
    orderId() {
      return this.$route.params.id;
    },
    hasMore() {
      return this.bookings.length < this.total;
    },
  },

  mounted() {
    this.fetchBookings();
  },

  methods: {
    async fetchBookings() {
      this.loading = true;
      try {
        const res = await api.get(`/api/order/${this.orderId}/bookings`, {
          params: {
            limit: this.limit,
            offset: this.offset,
          },
        });
        const data = res.data.data;
        this.bookings.push(...data.bookings);
        this.total = data.meta.total;
        this.offset += this.limit;
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        this.loading = false;
      }
    },

    goToBookingView(bookingId) {
      this.$router.push(`/booking/${bookingId}`);
    },
  },
};
</script>
