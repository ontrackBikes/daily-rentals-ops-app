<template>
  <v-container fluid>
    <!-- Loader  -->
    <div v-if="loading" class="pa-6">
      <v-skeleton-loader
        v-for="n in 3"
        :key="n"
        type="list-item-three-line"
        class="mb-4"
      />
    </div>

    <!-- Bookings List  -->
    <div v-else>
      <v-expansion-panels v-model="activePanel" accordion flat focusable>
        <v-expansion-panel
          v-for="booking in bookings"
          :key="booking.booking_id"
        >
          <v-card outlined class="rounded-lg my-2 pa-0">
            <!-- Row  -->
            <v-expansion-panel-header class="py-3">
              <v-row no-gutters align="center" class="">
                <v-col cols="4">
                  <div class="d-flex align-center">
                    <!-- <v-icon color="primary" class="mr-2">mdi-car</v-icon> -->

                    <v-img
                      v-if="booking.model_data?.image_url"
                      :src="booking.model_data?.image_url"
                      height="50"
                      width="50"
                      class="rounded-lg"
                      contain
                    ></v-img>

                    <v-icon
                      v-else
                      size="48"
                      color="grey"
                      class="rounded-lg pa-2"
                    >
                      mdi-motorbike
                    </v-icon>

                    <div class="text-truncate">
                      <div class="subtitle-1 font-weight-medium text-truncate">
                        #{{ booking.booking_id }} —
                        {{ booking.model_data?.model_name }}
                      </div>
                      <div class="caption grey--text text--darken-1">
                        Vehicle:
                        {{ booking.vehicle_data?.registration_number }} •
                        {{ booking.vehicle_data?.location_data?.name }}
                      </div>
                    </div>
                  </div>
                </v-col>
                <v-col cols="8" class="text-right">
                  <div class="d-flex align-top justify-end">
                    <v-chip
                      small
                      :color="getStatusColor(booking.status, 'booking')"
                      class="mr-4"
                      outlined
                    >
                      {{ booking.status || "N/A" }}
                    </v-chip>
                    <div class="text-right">
                      <h4>₹{{ booking.net_amount }}</h4>
                      <div class="caption grey--text">
                        {{ booking.sub_status }}
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-expansion-panel-header>

            <!-- Expand Content  -->
            <v-expansion-panel-content>
              <div>
                <h3
                  class="text-subtitle-1 d-flex align-center font-weight-medium mt-4"
                >
                  <v-icon start small color="primary" class="mr-2"
                    >mdi-calendar</v-icon
                  >
                  Booking Details
                </h3>
                <v-card outlined class="my-4 pa-2">
                  <div>
                    <v-btn
                      rounded
                      plain
                      class="pa-0"
                      color="primary"
                      @click.stop="goToBookingView(booking.booking_id)"
                    >
                      View Booking
                      <v-icon right small>mdi-open-in-new</v-icon>
                    </v-btn>
                  </div>
                  <v-row>
                    <!-- Booking Details -->
                    <v-col cols="12" md="6">
                      <div>
                        <div class="d-flex align-center my-2">
                          <v-icon small color="grey" class="mr-2"
                            >mdi-calendar-start</v-icon
                          >
                          <span class="mr-2 text-subtitle-2">Start:</span>
                          <span class="font-weight-bold text-subtitle-2">{{
                            formatDate(booking.start_date)
                          }}</span>
                        </div>

                        <div class="d-flex align-center my-4">
                          <v-icon small color="grey" class="mr-2"
                            >mdi-calendar-end</v-icon
                          >
                          <span class="mr-2 text-subtitle-2">End:</span>
                          <span class="font-weight-bold text-subtitle-2">{{
                            formatDate(booking.end_date)
                          }}</span>
                        </div>

                        <div class="d-flex align-center my-2">
                          <v-icon small color="grey" class="mr-2"
                            >mdi-source-branch</v-icon
                          >
                          <span class="mr-2 text-subtitle-2">Source:</span>
                          <span class="font-weight-bold text-subtitle-2">{{
                            booking.source_type
                          }}</span>
                        </div>
                      </div>
                    </v-col>

                    <!-- Customer Details -->
                    <v-col cols="12" md="6">
                      <div>
                        <div class="d-flex align-center my-2">
                          <v-icon small color="grey" class="mr-2"
                            >mdi-account</v-icon
                          >
                          <span class="mr-2 text-subtitle-2">Name:</span>
                          <span class="font-weight-bold text-subtitle-2">{{
                            booking.order_data?.customer_data?.display_name
                          }}</span>
                        </div>

                        <div class="d-flex align-center my-4">
                          <v-icon small color="grey" class="mr-2"
                            >mdi-pound</v-icon
                          >
                          <span class="mr-2 text-subtitle-2">Order ID:</span>
                          <span class="font-weight-bold text-subtitle-2">{{
                            booking.order_data?.internal_order_id
                          }}</span>
                        </div>

                        <div class="d-flex align-center my-2">
                          <v-icon small color="grey" class="mr-2"
                            >mdi-credit-card-outline</v-icon
                          >
                          <span class="mr-2 text-subtitle-2">Payment:</span>
                          <span class="font-weight-bold text-subtitle-2">{{
                            booking.order_data?.payment_status
                          }}</span>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-card>
                <!-- <v-divider class="my-4" /> -->

                <div>
                  <h3
                    class="text-subtitle-1 d-flex align-center font-weight-medium my-3"
                  >
                    <v-icon start small color="primary" class="mr-2"
                      >mdi-format-list-bulleted</v-icon
                    >
                    Line Items
                  </h3>

                  <v-card outlined rounded="lg">
                    <v-card-text class="pa-0">
                      <div
                        v-for="(data, index) in booking.booking_line_item_data"
                        :key="index"
                        class="d-flex justify-space-between align-center pa-3"
                        :class="
                          data.status !== 'active'
                            ? 'text-decoration-line-through'
                            : ''
                        "
                      >
                        <!-- Left: product info -->
                        <div>
                          <div class="font-weight-bold text-subtitle-2">
                            {{ data.product_name }} × {{ data.quantity }}
                          </div>
                          <div class="text-subtitle-2 grey--text">
                            {{ data.created_at | moment("lll") }}
                          </div>
                        </div>

                        <!-- Right: pricing -->
                        <div class="text-right">
                          <div class="font-weight-bold subtitle-2">
                            ₹{{ data.net_total }}
                            <del
                              v-if="
                                parseFloat(data.gross_total) >
                                parseFloat(data.net_total)
                              "
                              class="ml-1"
                            >
                              ₹{{ data.gross_total }}
                            </del>
                          </div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>

                <v-divider class="my-4" v-if="booking.status != 'cancelled'" />

                <v-row align="center" justify="space-between">
                  <v-col cols="12" class="text-right">
                    <!-- For Upcoming or Created Bookings -->
                    <div
                      v-if="
                        booking.status === 'upcoming' ||
                        booking.status === 'created'
                      "
                      class="d-flex flex-wrap justify-end"
                    >
                      <v-btn
                        color="warning"
                        rounded
                        depressed
                        class="mr-2 mb-2"
                        :block="$vuetify.breakpoint.smAndDown"
                        @click="cancelBookingDialog = true"
                      >
                        <v-icon left>mdi-cancel</v-icon>
                        Cancel
                      </v-btn>

                      <v-btn
                        color="primary"
                        rounded
                        depressed
                        class="mr-2 mb-2"
                        :block="$vuetify.breakpoint.smAndDown"
                        @click="startBookingDialog = true"
                      >
                        <v-icon left>mdi-play-circle</v-icon>
                        Start
                      </v-btn>

                      <v-btn
                        color="primary"
                        rounded
                        depressed
                        class="mb-2"
                        :block="$vuetify.breakpoint.smAndDown"
                        @click="exchangeDialog = true"
                      >
                        <v-icon left>mdi-swap-horizontal</v-icon>
                        Exchange
                      </v-btn>
                    </div>

                    <!-- For Active Bookings -->
                    <v-row
                      v-if="booking.status === 'active'"
                      dense
                      justify="end"
                    >
                      <v-col cols="12" sm="4" md="auto">
                        <v-btn
                          color="red"
                          dark
                          rounded
                          depressed
                          class="mb-2"
                          :block="$vuetify.breakpoint.smAndDown"
                          @click="endBookingDialog = true"
                        >
                          <v-icon left>mdi-stop-circle</v-icon>
                          End
                        </v-btn>
                      </v-col>

                      <v-col cols="12" sm="4" md="auto">
                        <v-btn
                          color="primary"
                          rounded
                          depressed
                          class="mb-2"
                          :block="$vuetify.breakpoint.smAndDown"
                          @click="openExtendDialog(booking)"
                        >
                          <v-icon left>mdi-clock-plus</v-icon>
                          Extend
                        </v-btn>
                      </v-col>

                      <v-col cols="12" sm="4" md="auto">
                        <v-btn
                          color="primary"
                          rounded
                          depressed
                          class="mb-2"
                          :block="$vuetify.breakpoint.smAndDown"
                          @click="exchangeDialog = true"
                        >
                          <v-icon left>mdi-swap-horizontal</v-icon>
                          Exchange
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </div>

              <!-- Start Booking  -->
              <v-dialog v-model="startBookingDialog" max-width="600">
                <start-booking
                  @refresh-booking="refreshPage"
                  @close-modal="startBookingDialog = false"
                  :booking="booking"
                ></start-booking>
              </v-dialog>

              <!-- Exchange  -->
              <v-dialog v-model="exchangeDialog" max-width="500px">
                <v-card>
                  <v-container>
                    <exchange-viewer
                      @exchangeConfirmed="refreshPage"
                      :booking_id="booking.booking_id"
                      @close-modal="exchangeDialog = false"
                    />
                  </v-container>
                </v-card>
              </v-dialog>

              <!-- Extend  -->
              <v-dialog v-model="extendDialog" max-width="500px">
                <extend-booking
                  @exchangeConfirmed="refreshPage"
                  :booking="selectedBooking"
                  @close-modal="extendDialog = false"
                />
              </v-dialog>

              <!-- End Booking  -->
              <v-dialog v-model="endBookingDialog" max-width="600">
                <end-booking
                  @refresh-booking="refreshPage"
                  @close-modal="endBookingDialog = false"
                  :booking="booking"
                ></end-booking>
              </v-dialog>

              <!-- Cancel Booking  -->
              <v-dialog v-model="cancelBookingDialog" max-width="600">
                <cancel-booking
                  @refresh-booking="refreshPage"
                  @close-modal="startBookingDialog = false"
                  :booking="booking"
                ></cancel-booking>
              </v-dialog>
            </v-expansion-panel-content>
          </v-card>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- No data  -->
      <div v-if="!loading && bookings.length === 0" class="text-center pa-8">
        <v-icon size="28" class="mb-2" color="grey">mdi-calendar-remove</v-icon>
        <div class="subtitle-2 mb-2">No bookings found</div>
        <v-btn color="primary" text @click="fetchBookings">Retry</v-btn>
      </div>

      <!-- Load More  -->
      <div class="text-center mt-4">
        <v-btn
          v-if="hasMore"
          :loading="loading"
          color="primary"
          outlined
          block
          @click="fetchBookings"
        >
          Load More
        </v-btn>
      </div>
    </div>
  </v-container>
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
