<template>
  <div>
    <!-- Booking Preview Dialog -->
    <v-dialog v-model="dialogVisible" max-width="600px">
      <v-card>
        <v-container>
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Booking Preview</div>
            <v-btn icon @click="closePreview">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <div class="mt-4">
            <v-alert v-if="previewError" type="error" dense text class="mb-4">
              {{ previewError }}
            </v-alert>

            <div
              v-if="!bookingPreview && !previewError"
              class="text-center pa-8"
            >
              <v-progress-circular indeterminate />
              <div class="mt-2">Loading preview...</div>
            </div>

            <div v-if="bookingPreview">
              <div class="mb-3">
                <strong>Plan:</strong>
                {{
                  bookingPreview?.modelDetails?.plan_name ||
                  bookingPreview?.modelDetails?.plan_type
                }}
              </div>

              <div class="my-2">
                <strong>Dates:</strong>
                {{
                  bookingPreview?.bookingDates?.start_date
                    | moment("DD/MM/YYYY")
                }}
                →
                {{
                  bookingPreview?.bookingDates?.end_date | moment("DD/MM/YYYY")
                }}
                <span class="grey--text text--darken-1">
                  ({{ bookingPreview?.bookingDates?.plan_type }})
                </span>
              </div>

              <v-divider class="my-3"></v-divider>

              <div>
                <strong>Items</strong>
                <v-card outlined class="rounded-lg my-4">
                  <v-simple-table class="mt-2">
                    <thead>
                      <tr>
                        <th class="text-left">Item</th>
                        <th class="text-left">Qty</th>
                        <th class="text-right">Unit</th>
                        <th class="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(li, idx) in bookingPreview?.lineItems || []"
                        :key="idx"
                      >
                        <td>{{ li.product_name }}</td>
                        <td>{{ li.quantity }}</td>
                        <td class="text-right">
                          ₹{{ formatAmount(li.unit_final_price) }}
                        </td>
                        <td class="text-right">
                          ₹{{ formatAmount(li.net_total || li.gross_total) }}
                        </td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </v-card>
              </div>

              <v-divider class="my-3"></v-divider>

              <div
                class="d-flex justify-space-between text-subtitle-2 font-weight-bold"
              >
                <span>Plan Rate</span>
                <span
                  >₹{{
                    formatAmount(bookingPreview?.pricingBreakdown?.planRate)
                  }}</span
                >
              </div>
              <div
                class="d-flex justify-space-between text-subtitle-2 font-weight-bold"
              >
                <span>Add-on Total</span>
                <span
                  >₹{{
                    formatAmount(bookingPreview?.pricingBreakdown?.addonTotal)
                  }}</span
                >
              </div>
              <div
                class="d-flex justify-space-between text-subtitle-1 font-weight-bold text-h6 mt-2"
              >
                <span>Total Payable</span>
                <span
                  >₹{{
                    formatAmount(bookingPreview?.pricingBreakdown?.totalPayable)
                  }}</span
                >
              </div>
            </div>
          </div>

          <div class="text-right mt-6">
            <v-btn text rounded depressed @click="closePreview" class="mr-2"
              >Cancel</v-btn
            >
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
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <!-- Booking Success Dialog -->
    <v-dialog v-model="bookingDialog" max-width="600px">
      <v-card>
        <v-card-title class="headline">Booking Created</v-card-title>
        <v-card-text>
          <div v-if="bookingResponse">
            <div class="mb-2">
              <strong>Booking ID:</strong>
              {{ bookingResponse.booking.booking_id }}
            </div>
            <div class="mb-2">
              <strong>Order:</strong>
              {{ bookingResponse.order.internal_order_id }}
            </div>
            <div class="mb-2">
              <strong>Total:</strong> ₹{{
                formatAmount(bookingResponse.order.order_total)
              }}
            </div>
            <div class="mb-2">
              <strong>Assigned Vehicle:</strong>
              {{
                bookingResponse.assignedVehicle?.registration_number ||
                "Not Assigned"
              }}
            </div>
            <div class="mb-2">
              <strong>Status:</strong> {{ bookingResponse.booking.status }}
            </div>
          </div>
          <div v-else class="text-center pa-6">
            <v-progress-circular indeterminate />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeBookingDialog">Close</v-btn>
          <v-btn color="primary" @click="proceedToPayment">View Bookings</v-btn>
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
    pricingId: Number,
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
