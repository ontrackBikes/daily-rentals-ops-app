<template>
  <div>
    <!-- Loader -->
    <div v-if="loading" class="text-center py-6">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Bookings List -->
    <v-expansion-panels v-model="activePanel" v-else accordion>
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
          <v-row>
            <v-col cols="4" class="my-auto">
              <v-chip
                class="my-auto"
                outlined
                small
                :color="getStatusColor(booking.status, 'booking')"
              >
                {{ booking.status || "N/A" }}
              </v-chip>
            </v-col>
            <v-col cols="8" class="my-auto text-right">
              <div
                v-if="
                  booking.status === 'upcoming' || booking.status === 'created'
                "
                class="d-flex"
              >
                <v-btn
                  color="warning"
                  dark
                  class="mr-2"
                  @click="cancelBookingDialog = true"
                  >Cancel Booking</v-btn
                >
                <v-btn color="primary" dark @click="startBookingDialog = true"
                  >Start Booking</v-btn
                >
              </div>

              <v-row v-if="booking.status === 'active'" class="my-4">
                <v-col cols="12">
                  <v-btn
                    rounded
                    depressed
                    color="red"
                    dark
                    @click="endBookingDialog = true"
                    >End Booking</v-btn
                  >
                </v-col>
                <v-col cols="12">
                  <v-btn
                    rounded
                    depressed
                    color="primary"
                    @click="openExtendDialog(booking)"
                  >
                    Extend Booking
                  </v-btn>
                </v-col>
                <v-col cols="12">
                  <v-btn
                    rounded
                    depressed
                    color="primary"
                    @click="exchangeDialog = true"
                    >Exchange</v-btn
                  >
                </v-col>
              </v-row>
            </v-col>
          </v-row>

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
            <v-row
              no-gutters
              v-for="(data, index) in booking.booking_line_item_data"
              :key="index"
              :class="
                data.status == 'active' ? '' : 'text-decoration-line-through'
              "
            >
              <v-col cols="6" class="text-truncate"
                >{{ data.product_name }} × {{ data.quantity }}</v-col
              >
              <v-col cols="4">{{ data.created_at | moment("lll") }}</v-col>
              <v-col cols="2" class="text-right">
                ₹{{ data.net_total }}
                <del
                  v-if="
                    parseFloat(data.gross_total) > parseFloat(data.net_total)
                  "
                >
                  ₹{{ data.gross_total }}
                </del>
              </v-col>
            </v-row>
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
        <v-dialog v-model="startBookingDialog" max-width="600">
          <v-card>
            <start-booking
              @refresh-booking="refreshPage"
              @close-modal="startBookingDialog = false"
              :booking="booking"
            ></start-booking>
          </v-card>
        </v-dialog>

        <v-dialog v-model="exchangeDialog" max-width="500px">
          <v-card>
            <v-container>
              <!-- Header -->
              <exchange-viewer
                @exchangeConfirmed="refreshPage"
                :booking_id="booking.booking_id"
                @close-modal="exchangeDialog = false"
              />
            </v-container>
          </v-card>
        </v-dialog>

        <v-dialog v-model="extendDialog" max-width="500px">
          <v-card>
            <v-container>
              <!-- Header -->
              <extend-booking
                @exchangeConfirmed="refreshPage"
                :booking="selectedBooking"
                @close-modal="extendDialog = false"
              />
            </v-container>
          </v-card>
        </v-dialog>

        <v-dialog v-model="endBookingDialog" max-width="600">
          <v-card>
            <end-booking
              @refresh-booking="refreshPage"
              @close-modal="endBookingDialog = false"
              :booking="booking"
            ></end-booking>
          </v-card>
        </v-dialog>

        <v-dialog v-model="cancelBookingDialog" max-width="600">
          <v-card>
            <cancel-booking
              @refresh-booking="refreshPage"
              @close-modal="startBookingDialog = false"
              :booking="booking"
            ></cancel-booking>
          </v-card>
        </v-dialog>
      </v-expansion-panel>
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
import ExchangeViewer from "@/components/ExchangeViewer.vue";
import ExtendBooking from "@/components/ExtendBooking.vue";
import EndBooking from "@/components/EndBooking.vue";
import CancelBooking from "@/components/CancelBooking.vue";

export default {
  components: {
    StartBooking,
    ExchangeViewer,
    ExtendBooking,
    EndBooking,
    CancelBooking,
  },
  props: {
    refreshOrder: { type: Function, required: true },
  },
  name: "BookingsList",
  data() {
    return {
      cancelBookingDialog: false,
      endBookingDialog: false,
      extensionDialog: false,
      extendDialog: false,
      exchangeDialog: false,
      activePanel: [],
      bookings: [],
      total: 0,
      limit: 10,
      offset: 0,
      loading: false,
      startBookingDialog: false,
      orderId: "",
      selectedBooking: null,
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
    openExtendDialog(booking) {
      this.selectedBooking = booking;
      this.extendDialog = true;
    },
    refreshPage() {
      this.fetchBookings();
      this.refreshOrder();
    },
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
