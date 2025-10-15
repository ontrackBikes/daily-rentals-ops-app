<template>
  <div>
    <!-- Booking Preview Dialog -->
    <v-dialog v-model="dialogVisible" max-width="650px" scrollable>
      <v-card class="pa-0">
        <!-- Header -->
        <v-card-title
          class="d-flex justify-space-between align-center grey lighten-4"
        >
          <div class="font-weight-bold text-h6">🧾 Booking Preview</div>
          <v-btn icon @click="closePreview">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <v-alert v-if="previewError" type="error" dense text class="mb-4">
            {{ previewError }}
          </v-alert>

          <!-- Loading State -->
          <div v-if="!bookingPreview && !previewError" class="text-center pa-8">
            <v-progress-circular indeterminate />
            <div class="mt-2">Loading preview...</div>
          </div>

          <!-- Booking Preview Content -->
          <div v-if="bookingPreview">
            <!-- Header Section -->
            <div class="d-flex justify-space-between align-center mb-4">
              <div>
                <div class="text-subtitle-2 grey--text text--darken-1">
                  Booking Type
                </div>
                <div class="text-subtitle-1 font-weight-bold text-capitalize">
                  {{ bookingPreview.bookingDates.plan_type }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-subtitle-2 grey--text text--darken-1">
                  Period
                </div>
                <div class="text-subtitle-1 font-weight-bold">
                  {{
                    bookingPreview.bookingDates.start_date
                      | moment("DD MMM YYYY")
                  }}
                  →
                  {{
                    bookingPreview.bookingDates.end_date | moment("DD MMM YYYY")
                  }}
                </div>
              </div>
            </div>

            <!-- Plan & Delivery Details -->
            <v-card outlined class="mb-4 pa-4 rounded-lg">
              <div class="text-subtitle-1 font-weight-bold mb-2">
                {{ bookingPreview.modelDetails.plan_name }}
              </div>
              <div class="text-body-2">
                Model:
                <strong>{{ bookingPreview.modelDetails.model_name }}</strong>
              </div>
              <div
                v-if="bookingPreview.deliveryDetails"
                class="mt-2 text-body-2"
              >
                Delivery to:
                <strong>{{ bookingPreview.deliveryDetails.address }}</strong>
                <div>
                  Fee: ₹{{
                    formatAmount(bookingPreview.deliveryDetails.delivery_fee)
                  }}
                </div>
              </div>
            </v-card>

            <!-- Items Table -->
            <div class="font-weight-bold text-subtitle-1 mb-2">Items</div>
            <v-simple-table class="elevation-1 rounded-lg mb-4">
              <thead>
                <tr class="grey lighten-4">
                  <th class="text-left py-2 px-3">Item</th>
                  <th class="text-center py-2 px-3">Qty</th>
                  <th class="text-right py-2 px-3">Unit</th>
                  <th class="text-right py-2 px-3">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(li, idx) in bookingPreview.lineItems"
                  :key="idx"
                  :class="idx % 2 === 0 ? 'grey lighten-5' : ''"
                >
                  <td class="py-2 px-3">{{ li.product_name }}</td>
                  <td class="text-center py-2 px-3">{{ li.quantity }}</td>
                  <td class="text-right py-2 px-3">
                    ₹{{ formatAmount(li.unit_final_price) }}
                  </td>
                  <td class="text-right py-2 px-3">
                    ₹{{ formatAmount(li.net_total || li.gross_total) }}
                  </td>
                </tr>
              </tbody>
            </v-simple-table>

            <!-- Totals Section -->
            <v-card outlined class="pa-4 rounded-lg">
              <div class="d-flex justify-space-between text-body-2 mb-2">
                <span>Plan Rate</span>
                <span
                  >₹{{
                    formatAmount(bookingPreview.pricingBreakdown.planRate)
                  }}</span
                >
              </div>
              <div class="d-flex justify-space-between text-body-2 mb-2">
                <span>Add-ons</span>
                <span
                  >₹{{
                    formatAmount(bookingPreview.pricingBreakdown.addonTotal)
                  }}</span
                >
              </div>
              <div
                v-if="bookingPreview.deliveryDetails?.delivery_fee"
                class="d-flex justify-space-between text-body-2 mb-2"
              >
                <span>Delivery Fee</span>
                <span
                  >₹{{
                    formatAmount(bookingPreview.deliveryDetails.delivery_fee)
                  }}</span
                >
              </div>
              <v-divider class="my-2"></v-divider>
              <div
                class="d-flex justify-space-between text-h6 font-weight-bold primary--text"
              >
                <span>Total Payable</span>
                <span
                  >₹{{
                    formatAmount(bookingPreview.pricingBreakdown.totalPayable)
                  }}</span
                >
              </div>
            </v-card>
          </div>
        </v-card-text>

        <!-- Footer Buttons -->
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn text rounded @click="closePreview" class="mr-2">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            rounded
            depressed
            :disabled="!bookingPreview || confirmLoading"
            :loading="confirmLoading"
            @click="confirmBooking"
          >
            Confirm & Create Booking
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Booking Success Dialog -->
    <!-- Booking Success Dialog -->
    <v-dialog v-model="bookingDialog" max-width="480px" persistent>
      <v-card class="pa-0 overflow-hidden">
        <!-- Success State -->
        <v-card-text v-if="bookingResponse" class="pa-6 text-center">
          <v-icon color="success" size="80" class="mb-4">
            mdi-check-circle-outline
          </v-icon>
          <div class="text-h5 font-weight-bold mb-1">
            Booking Created Successfully
          </div>
          <div class="text-body-2 grey--text mb-5">
            Your booking has been confirmed and saved. You can view or manage it
            from the bookings page.
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="text-left">
            <div class="d-flex justify-space-between mb-2">
              <span class="grey--text text--darken-1">Booking ID</span>
              <span class="font-weight-medium">{{
                bookingResponse.booking.booking_id
              }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="grey--text text--darken-1">Order No.</span>
              <span class="font-weight-medium">{{
                bookingResponse.order.internal_order_id
              }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="grey--text text--darken-1">Total</span>
              <span class="font-weight-bold">
                ₹{{ formatAmount(bookingResponse.order.order_total) }}
              </span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="grey--text text--darken-1">Assigned Vehicle</span>
              <span class="font-weight-medium">
                {{
                  bookingResponse.assignedVehicle?.registration_number ||
                  "Not Assigned"
                }}
              </span>
            </div>
            <div class="d-flex justify-space-between">
              <span class="grey--text text--darken-1">Status</span>
              <span class="font-weight-medium text-capitalize">
                {{ bookingResponse.booking.status }}
              </span>
            </div>
          </div>
        </v-card-text>

        <!-- Loading State -->
        <v-card-text v-else class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" size="48" />
          <div class="mt-3 grey--text">Creating your booking...</div>
        </v-card-text>

        <!-- Error State -->
        <v-card-text v-if="bookingError">
          <v-alert type="error" text dense>
            {{ bookingError }}
          </v-alert>
        </v-card-text>

        <!-- Footer Buttons -->
        <v-card-actions class="pa-4 justify-end">
          <v-btn text @click="closeBookingDialog">Close</v-btn>
          <v-btn
            v-if="bookingResponse"
            color="primary"
            depressed
            rounded
            @click="proceedToPayment"
          >
            View Booking
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "CreateBookingDialog",
  props: {
    open: Boolean,
    customerId: Number,
    pricingId: [Number, String],
    addons: Array,
    vehicleId: [Number, String],
    locationId: [Number, String],
    deliveryDetails: Object,
    isConfirmMode: Boolean,
  },
  data() {
    return {
      bookingPreview: null,
      previewError: null,
      bookingDialog: false,
      bookingResponse: null,
      confirmLoading: false,
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.open;
      },
      set(val) {
        this.$emit("update:open", val);
      },
    },
  },
  watch: {
    open(val) {
      if (val && !this.isConfirmMode) this.fetchPreview();
    },
  },
  methods: {
    formatAmount(value) {
      if (!value && value !== 0) return "0";
      return Number(value).toLocaleString("en-IN");
    },
    async fetchPreview() {
      this.previewError = null;
      this.bookingPreview = null;
      try {
        const payload = {
          pricing_id: this.pricingId,
          addons: this.addons || [],
          location_id: this.locationId || null,
          delivery_details: this.deliveryDetails || {},
        };
        const { data } = await api.post("/api/booking/preview", payload);
        if (data.success) this.bookingPreview = data.data;
        else this.previewError = data.message || "Failed to fetch preview";
      } catch (err) {
        this.previewError =
          err?.response?.data?.message || err.message || "Network error";
      }
    },
    closePreview() {
      this.dialogVisible = false;
      this.bookingPreview = null;
      this.previewError = null;
    },
    async confirmBooking() {
      if (!this.customerId) {
        this.previewError = "Customer is required to confirm booking";
        return;
      }
      this.confirmLoading = true;
      try {
        const payload = {
          pricing_id: this.pricingId,
          customer_id: this.customerId,
          addons: this.addons || [],
          vehicle_id: this.vehicleId || null,
          location_id: this.locationId || null,
          delivery_details: this.deliveryDetails || {},
        };
        const { data } = await api.post("/api/booking/v2", payload);
        if (data.success) {
          this.bookingResponse = data.data;
          this.dialogVisible = false;
          this.bookingDialog = true;
        } else {
          this.previewError = data.message || "Booking failed";
        }
      } catch (err) {
        this.previewError =
          err?.response?.data?.message || err.message || "Network error";
      } finally {
        this.confirmLoading = false;
      }
    },
    closeBookingDialog() {
      this.bookingDialog = false;
      this.bookingResponse = null;
    },
    proceedToPayment() {
      if (!this.bookingResponse) return;
      const bookingId = this.bookingResponse.booking.booking_id;
      this.$router.push({ path: `/booking/${bookingId}/overview` });
    },
  },
};
</script>
