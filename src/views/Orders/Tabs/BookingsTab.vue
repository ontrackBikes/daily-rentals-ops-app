<template>
  <div>
    <!-- Loader -->
    <div v-if="loading" class="text-center py-6">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Bookings List -->
    <v-expansion-panels v-else accordion>
      <v-expansion-panel v-for="booking in bookings" :key="booking.booking_id">
        <!-- Row -->
        <v-expansion-panel-header>
          <div class="d-flex justify-space-between flex-grow-1">
            <div>
              <div class="font-weight-bold">
                #{{ booking.booking_id }} - {{ booking.model_data?.model_name }}
              </div>
              <small>
                Vehicle: {{ booking.vehicle_data?.registration_number }} |
                {{ booking.vehicle_data?.location_data?.name }}
              </small>
            </div>
            <div class="text-right">
              <div>
                <strong>₹{{ booking.net_amount }}</strong>
              </div>
              <div class="grey--text">
                {{ booking.status }} ({{ booking.sub_status }})
              </div>
            </div>
          </div>
        </v-expansion-panel-header>

        <!-- Expand Content -->
        <v-expansion-panel-content>
          <v-divider class="my-2" />
          <v-chip
            class="my-auto"
            outlined
            small
            :color="getStatusColor(booking.status, 'booking')"
          >
            {{ booking.status || "N/A" }}
          </v-chip>
          <div
            v-if="booking.status === 'upcoming'"
            class="d-flex justify-end my-4"
          >
            <v-btn
              color="warning"
              dark
              class="mr-2"
              @click="openCancelBookingDialog = true"
              >Cancel Booking</v-btn
            >
            <v-btn color="primary" dark @click="openStartBookingDialog = true"
              >Start Booking</v-btn
            >
          </div>

          <div>
            <h4 class="subtitle-2 font-weight-bold mb-2">Booking Details</h4>
            <ul>
              <li>
                <strong>Start:</strong> {{ formatDate(booking.start_date) }}
              </li>
              <li><strong>End:</strong> {{ formatDate(booking.end_date) }}</li>
              <li><strong>Source:</strong> {{ booking.source_type }}</li>
            </ul>
          </div>

          <div class="mt-4">
            <h4 class="subtitle-2 font-weight-bold mb-2">Customer</h4>
            <ul>
              <li>
                <strong>Name:</strong>
                {{ booking.order_data?.customer_data?.display_name }}
              </li>
              <li>
                <strong>Order ID:</strong>
                {{ booking.order_data?.internal_order_id }}
              </li>
              <li>
                <strong>Payment Status:</strong>
                {{ booking.order_data?.payment_status }}
              </li>
            </ul>
          </div>

          <div class="mt-4">
            <h4 class="subtitle-2 font-weight-bold mb-2">Line Items</h4>
            <div
              v-for="line in booking.booking_line_item_data"
              :key="line.line_item_id"
              class="d-flex justify-space-between mb-1"
              :class="
                line.status === 'active' ? '' : 'text-decoration-line-through'
              "
            >
              <span>
                {{ line.product_name }} × {{ line.quantity }}
                <small v-if="line.reason">({{ line.reason }})</small>
              </span>
              <strong>
                ₹{{ line.net_total }}
                <del
                  v-if="
                    parseFloat(line.gross_total) > parseFloat(line.net_total)
                  "
                >
                  ₹{{ line.gross_total }}
                </del>
              </strong>
            </div>
          </div>

          <div class="text-right mt-4">
            <v-btn
              small
              color="primary"
              text
              @click.stop="goToBookingView(booking.booking_id)"
            >
              View Booking
            </v-btn>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-dialog v-model="startBookingDialog">
        <v-card>
          <start-booking :booking="booking"></start-booking>
        </v-card>
      </v-dialog>
    </v-expansion-panels>

    <!-- No data -->
    <div v-if="!loading && bookings.length === 0" class="text-center py-4">
      No bookings found
    </div>

    <!-- Load More -->
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
  </div>
</template>

<script>
import api from "@/plugins/axios";
import StartBooking from "@/components/StartBooking.vue";
import StatusService from "@/plugins/statusColor";

export default {
  components: { StartBooking },
  name: "BookingsList",
  data() {
    return {
      bookings: [],
      total: 0,
      limit: 10,
      offset: 0,
      loading: false,
      startBookingDialog: false,
      orderId: "",
    };
  },
  computed: {
    hasMore() {
      return this.bookings.length < this.total;
    },
  },
  mounted() {
    this.orderId = this.$route.params.id;
    this.fetchBookings();
  },
  methods: {
    async fetchBookings() {
      if (this.loading) return; // ✅ prevent multiple clicks
      this.loading = true;
      try {
        const res = await api.get(`/api/order/${this.orderId}/bookings`, {
          params: { limit: this.limit, offset: this.offset },
        });

        const data = res.data.data;

        if (data?.bookings?.length > 0) {
          // ✅ Append results
          this.bookings.push(...data.bookings);

          // ✅ Update total count from API
          this.total = data.meta.total;

          // ✅ Only increase offset by number of records fetched
          this.offset += data.bookings.length;
        } else {
          // No more records
          this.total = this.bookings.length;
        }
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        this.loading = false;
      }
    },
    goToBookingView(bookingId) {
      this.$router.push(`/booking/${bookingId}`);
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    getStatusColor(status, type) {
      return StatusService.getColor(status, type);
    },
  },
};
</script>
