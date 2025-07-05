<template>
  <v-container>
    <!-- Header Row -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="4" class="d-flex align-center">
        <div class="text-h6 font-weight-bold">Bookings ({{ total }})</div>
      </v-col>

      <v-col cols="12" md="8">
        <div class="d-flex flex-wrap gap-2">
          <v-text-field
            v-model="searchQuery"
            append-icon="mdi-magnify"
            placeholder="Search by name, phone, reg. no., model, location..."
            dense
            outlined
            hide-details
            class="mr-2 flex-grow-1"
            @input="onSearchInput"
            @keyup.enter="fetchBookings"
          />
          <v-btn color="primary" dark @click="openCreateBookingDialog = true">
            <v-icon left>mdi-plus</v-icon>
            Add Booking
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Table -->
    <v-card class="rounded-lg my-4" outlined :loading="loading">
      <v-simple-table>
        <thead>
          <tr>
            <th class="text-left">ID</th>
            <th class="text-left">Name</th>
            <th class="text-left">Phone</th>
            <th class="text-left">Email</th>
            <th class="text-left">Status</th>
            <th class="text-left">Created At</th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in bookings" :key="booking.id">
            <td>{{ booking.booking_id }}</td>
            <td>{{ booking.display_name }}</td>
            <td>{{ booking.user_data?.phone }}</td>
            <td>{{ booking.email }}</td>
            <td>
              <v-chip
                :color="getStatusColor(booking.status)"
                text-color="white"
                small
              >
                {{ booking.status }}
              </v-chip>
            </td>
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
          <tr v-if="!bookings.length">
            <td colspan="7" class="text-center grey--text">
              No Bookings found.
            </td>
          </tr>
        </tbody>
      </v-simple-table>

      <v-divider></v-divider>
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

    <!-- Add Booking Dialog -->
    <v-dialog v-model="openCreateBookingDialog" max-width="500px">
      <v-card :loading="loading">
        <v-container>
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Add Booking</div>
            <v-btn icon @click="openCreateBookingDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-form ref="form" v-model="formValid" class="my-4">
            <!-- Name -->
            <label class="text-subtitle-2"
              >Name <span class="red--text">*</span></label
            >
            <v-text-field
              v-model="form.name"
              :rules="[rules.required]"
              outlined
              dense
              hide-details
              class="mb-3"
              required
            />

            <!-- Phone -->
            <label class="text-subtitle-2"
              >Phone <span class="red--text">*</span></label
            >
            <v-text-field
              v-model="form.phone"
              type="tel"
              :rules="[rules.required, rules.numeric]"
              outlined
              dense
              hide-details
              class="mb-3"
              required
            />

            <!-- Email -->
            <label class="text-subtitle-2"
              >Email <span class="red--text">*</span></label
            >
            <v-text-field
              v-model="form.email"
              type="email"
              :rules="[rules.required, rules.email]"
              outlined
              dense
              hide-details
              class="mb-3"
              required
            />

            <!-- Address -->
            <label class="text-subtitle-2">Address</label>
            <v-textarea
              v-model="form.address"
              outlined
              dense
              rows="2"
              hide-details
              class="mb-2"
            />
          </v-form>

          <!-- Actions -->
          <div class="d-flex justify-end">
            <v-btn text class="mr-2" @click="openCreateBookingDialog = false"
              >Cancel</v-btn
            >
            <v-btn color="primary" :disabled="!formValid" @click="createBooking"
              >Create</v-btn
            >
          </div>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/plugins/axios";
import debounce from "lodash/debounce";

export default {
  name: "BookingList",
  data() {
    return {
      loading: false,
      bookings: [],
      total: 0,
      page: 1,
      limit: 20,
      pageCount: 1,
      searchQuery: "",
      openCreateBookingDialog: false,
      formValid: false,
      form: {
        name: "",
        phone: "",
        email: "",
        address: "",
      },
      rules: {
        required: (v) => !!v || "Required.",
        email: (v) =>
          !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Invalid email.",
        numeric: (v) => /^\d{10}$/.test(v) || "Must be exactly 10 digits",
      },
    };
  },
  watch: {
    searchQuery: "onSearchInput",
  },
  created() {
    this.onSearchInput = debounce(this.fetchBookings, 400);
  },
  mounted() {
    this.fetchBookings();
  },
  methods: {
    async fetchBookings() {
      this.loading = true;
      const offset = (this.page - 1) * this.limit;
      try {
        const { data } = await api.get(`/api/order/1/bookings`, {
          params: {
            limit: this.limit,
            offset,
            search: this.searchQuery || undefined,
          },
        });
        this.bookings = data?.data?.Bookings || [];
        this.total = data?.data?.meta?.count || 0;
        this.pageCount = Math.ceil(this.total / this.limit) || 1;
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        this.loading = false;
      }
    },
    async createBooking() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      try {
        const response = await api.post("/api/booking", this.form);
        this.openCreateBookingDialog = false;
        this.$refs.form.reset();
        this.fetchBookings();
        this.$swal.fire({
          icon: "success",
          title: "Booking Created",
          text: response.data?.message || "Booking added successfully!",
          confirmButtonColor: "#1976d2",
        });
      } catch (err) {
        console.error("Add error:", err);
        this.$swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "Something went wrong!",
          confirmButtonColor: "#d33",
        });
      } finally {
        this.loading = false;
      }
    },
    viewBooking(id) {
      this.$router.push(`/booking/${id}`);
    },
    getStatusColor(status) {
      switch (status?.toLowerCase()) {
        case "active":
          return "green";
        case "inactive":
          return "red";
        default:
          return "blue";
      }
    },
  },
};
</script>

<style scoped>
/* Optional: Add custom styles here */
</style>
