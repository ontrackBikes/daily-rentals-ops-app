<template>
  <v-container>
    <!-- Header Row -->

    <!-- Header Row -->
    <v-row align="center" class="my-2" dense>
      <!-- Title -->
      <v-col cols="12" md="3" class="d-flex align-center mb-2 mb-md-0">
        <div class="text-h6 font-weight-bold">Bookings ({{ total }})</div>
      </v-col>

      <!-- Filter & Sort -->
      <v-col cols="12" md="9" class="d-flex flex-wrap align-center justify-end">
        <!-- Source Type -->
        <v-select
          v-model="selectedSourceType"
          :items="sourceTypeOptions"
          label="Source Type"
          outlined
          dense
          hide-details
          class="mr-2 mb-2 flex-grow-1 flex-md-grow-0"
          @change="fetchBookings"
        />

        <!-- Sub Status -->
        <v-select
          v-model="selectedSubStatus"
          :items="subStatusOptions"
          label="Sub Status"
          outlined
          dense
          hide-details
          class="mr-2 mb-2 flex-grow-1 flex-md-grow-0"
          @change="fetchBookings"
        />

        <!-- Add Booking Button -->
        <!-- <v-btn color="primary" dark class="mb-2" to="/create-booking">
          <v-icon left>mdi-plus</v-icon>
          Add Booking
        </v-btn> -->
      </v-col>
    </v-row>

    <div>
      <v-text-field
        v-model="searchQuery"
        append-icon="mdi-magnify"
        placeholder="Search by name, phone, reg. no., model, location..."
        dense
        outlined
        hide-details
        class="w-100"
        @keyup.enter="fetchBookings"
      />
    </div>

    <!-- Table -->
    <v-card class="rounded-lg my-4" outlined :loading="loading">
      <v-simple-table>
        <thead>
          <tr>
            <th class="text-left">Booking ID</th>
            <th class="text-left">Regn No.</th>
            <th class="text-left">Model</th>
            <th class="text-left">Customer</th>
            <th class="text-left">Status</th>
            <th class="text-left">Source</th>
            <th class="text-left">Created At</th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in bookings" :key="booking.id">
            <td>{{ booking.booking_id }}</td>
            <td>{{ booking.vehicle_data?.registration_number }}</td>
            <td>{{ booking.vehicle_data?.model_data?.model_name }}</td>
            <td>{{ booking.order_data?.customer_data?.display_name }}</td>
            <td>
              <v-chip :color="getStatusColor(booking.status, 'booking')" small>
                {{ booking.status }}
              </v-chip>
            </td>
            <td>{{ booking.source_type }}</td>
            <td>{{ booking.created_at | moment }}</td>
            <td>
              <v-btn
                small
                outlined
                color="primary"
                @click="viewBooking(booking.booking_id)"
              >
                View
              </v-btn>
            </td>
          </tr>
          <tr v-if="!bookings.length && !loading">
            <td colspan="7" class="text-center grey--text">
              No Bookings found.
            </td>
          </tr>
        </tbody>
      </v-simple-table>

      <v-divider></v-divider>

      <!-- Pagination -->
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
import api from "@/plugins/axios";
import StatusService from "@/plugins/statusColor";
import debounce from "lodash/debounce";

export default {
  name: "BookingList",
  data() {
    return {
      booking_status: null, // status from route param
      loading: false,
      bookings: [],
      total: 0,
      page: 1,
      limit: 20,
      pageCount: 1,
      searchQuery: "",
      selectedSourceType: "",
      selectedSubStatus: null,
      sourceTypeOptions: [
        { text: "All", value: "" },
        { text: "New", value: "new" },
        { text: "Extend", value: "extend" },
        { text: "Exchange", value: "exchange" },
      ],
      subStatusOptions: [
        // 👈 added
        { text: "All", value: null },
        { text: "Ongoing", value: "ongoing" },
        { text: "Expired", value: "expired" },
        { text: "Hold", value: "hold" },
      ],
    };
  },

  watch: {
    "$route.params.status"(newVal) {
      this.booking_status = newVal || null;
      this.page = 1;
      this.fetchBookings();
    },
    searchQuery: "onSearchInput",
  },

  created() {
    this.onSearchInput = debounce(this.fetchBookings, 400);
  },

  mounted() {
    this.booking_status = this.$route.params.status || null;
    this.fetchBookings();
  },

  methods: {
    async fetchBookings() {
      this.loading = true;
      const offset = (this.page - 1) * this.limit;

      try {
        const { data } = await api.get(`/api/bookings`, {
          params: {
            limit: this.limit,
            offset,
            search: this.searchQuery || undefined,
            source_type: this.selectedSourceType,
            status: this.booking_status,
            sub_status: this.selectedSubStatus || undefined, // 👈 added
          },
        });

        this.bookings = data?.data?.bookings || [];
        this.total = data?.data?.meta?.total || 0;
        this.pageCount = Math.ceil(this.total / this.limit) || 1;
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        this.loading = false;
      }
    },

    viewBooking(id) {
      this.$router.push(`/booking/${id}`);
    },

    getStatusColor(status, type) {
      return StatusService.getColor(status, type);
    },
  },
};
</script>

<style scoped>
/* Optional: Add custom styles here */
</style>
