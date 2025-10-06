<template>
  <deep-layout>
    <v-container class="py-8">
      <v-row>
        <!-- Left Column - Form -->
        <v-col cols="12" md="8">
          <v-card outlined class="rounded-lg">
            <v-card-title class="grey white--text">
              <v-icon left color="white">mdi-account-edit</v-icon>
              Customer Information
            </v-card-title>

            <v-card-text class="pa-6">
              <v-form ref="form" v-model="formValid" lazy-validation>
                <!-- Existing Customer -->
                <div class="mb-6">
                  <v-subheader class="px-0 text-subtitle-1 font-weight-bold">
                    <v-icon left>mdi-account-search</v-icon>
                    Select Existing Customer (Required)
                  </v-subheader>
                  <SelectCustomer
                    v-model="selectedCustomer"
                    @input="populateCustomer"
                  />
                  <div
                    v-if="!selectedCustomer && triedToSubmit"
                    class="red--text text-caption mt-2"
                  >
                    Please select or create a customer before booking.
                  </div>
                </div>

                <v-divider class="my-6"></v-divider>

                <!-- Personal Details (kept editable for guest/updates) -->
                <v-subheader class="px-0 text-subtitle-1 font-weight-bold mb-4">
                  <v-icon left>mdi-account</v-icon>
                  Personal Details
                </v-subheader>

                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.name"
                      label="Full Name"
                      outlined
                      dense
                      :rules="[rules.required]"
                      prepend-inner-icon="mdi-account"
                      :disabled="true"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.phone"
                      label="Phone Number"
                      outlined
                      dense
                      :rules="[rules.required, rules.phone]"
                      prepend-inner-icon="mdi-phone"
                      :disabled="true"
                    />
                  </v-col>
                </v-row>

                <v-text-field
                  v-model="form.email"
                  label="Email Address"
                  outlined
                  dense
                  :rules="[rules.required, rules.email]"
                  prepend-inner-icon="mdi-email"
                  class="mb-4"
                />

                <v-textarea
                  v-model="form.address"
                  label="Complete Address"
                  outlined
                  dense
                  rows="3"
                  prepend-inner-icon="mdi-map-marker"
                  class="mb-6"
                />
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column - Summary & Actions -->
        <v-col cols="12" md="4">
          <v-card outlined class="pa-4 rounded-lg sticky-card">
            <v-img
              :src="model?.image_url"
              height="200"
              class="rounded-lg mb-3"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.3)"
              contain
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="primary" />
                </v-row>
              </template>
            </v-img>

            <div class="subtitle-1 font-weight-bold mb-2">
              {{ model?.model_name || "Vehicle model" }}
            </div>

            <div class="mb-3">
              <v-chip small class="mr-2 mb-1" color="success" outlined>
                <v-icon small left>mdi-leaf</v-icon>
                {{ model?.vehicle_type || "—" }}
              </v-chip>
              <v-chip small class="mr-2 mb-1" outlined>
                <v-icon small left>mdi-account-multiple</v-icon>
                {{ model?.seat_capacity || "—" }} Seats
              </v-chip>
              <v-chip small class="mb-1" outlined>
                <v-icon small left>mdi-speedometer</v-icon>
                {{ model?.range_km || "—" }} km Range
              </v-chip>
            </div>

            <p class="body-2 text--secondary">
              {{ (model?.description || "").substring(0, 120) }}...
            </p>

            <v-divider class="my-4"></v-divider>
            <div class="subtitle-1 font-weight-bold">Payment Summary</div>
            <div>
              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-subtitle-2">Subscription Plan</span>
                <span class="font-weight-bold">{{ subscription }}</span>
              </div>

              <div
                v-if="addons && addons.length > 0"
                class="d-flex justify-space-between align-center mb-3"
              >
                <span class="text-subtitle-2">Add-ons</span>
                <div class="mt-2">
                  <v-chip
                    v-for="(addon, i) in addons"
                    :key="i"
                    class="ma-1"
                    outlined
                    small
                  >
                    <v-icon left small>mdi-check</v-icon>
                    {{ addon.name || addon.title || addon }}
                  </v-chip>
                </div>
              </div>

              <v-divider class="my-4"></v-divider>

              <div class="d-flex justify-space-between align-center mb-4">
                <span class="text-h6 font-weight-bold">Total Amount</span>
                <span class="text-h5 success--text font-weight-bold"
                  >₹{{ formatAmount(total) }}</span
                >
              </div>

              <v-btn
                color="primary"
                depressed
                block
                large
                rounded
                :disabled="!formValid || previewLoading"
                :loading="previewLoading"
                @click="previewBooking"
              >
                Preview & Confirm
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Overlay while any global action runs -->
    <v-overlay :value="globalLoading" absolute>
      <v-progress-circular indeterminate size="64" />
    </v-overlay>

    <!-- Booking Preview Dialog -->
    <v-dialog v-model="previewDialog" max-width="600px">
      <v-card>
        <v-container>
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Booking Preview</div>
            <v-btn icon @click="previewDialog === false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <div class="mt-4">
            <div v-if="previewError" class="mb-4">
              <v-alert type="error" dense text>
                {{ previewError }}
              </v-alert>
            </div>

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
                <span class="grey--text text--darken-1"
                  >({{ bookingPreview?.bookingDates?.plan_type }})</span
                >
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

              <!-- <div class="mt-4">
                <small class="grey--text">
                  Model: {{ bookingPreview?.modelDetails?.model_name }} • Plan:
                  {{
                    bookingPreview?.modelDetails?.plan_name ||
                    bookingPreview?.modelDetails?.plan_type
                  }}
                </small>
              </div> -->
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
              @click="confirmBookingFromPreview"
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
          <v-spacer /> <v-btn text @click="closeBookingDialog">Close</v-btn>
          <v-btn color="primary" @click="proceedToPayment">View Bookings</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </deep-layout>
</template>

<script>
import SelectCustomer from "@/components/SelectCustomer.vue";
import DeepLayout from "@/Layouts/DeepLayout.vue";
import api from "@/plugins/axios";

export default {
  name: "CustomerDetailsPage",
  components: { SelectCustomer, DeepLayout },
  data() {
    return {
      model: null,
      loading: false,
      globalLoading: false,
      selectedCustomer: null,
      form: {
        name: "",
        email: "",
        phone: "",
        address: "",
      },
      formValid: false,
      triedToSubmit: false,

      rules: {
        required: (v) => !!v || "This field is required",
        email: (v) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email",
        phone: (v) =>
          /^[6-9]\d{9}$/.test(v) || "Enter a valid 10-digit phone number",
      },

      total: null,
      subscription: null,
      addons: [],
      model_id: null,
      pricing_id: null,
      vehicle_id: null,

      // Preview & booking states
      previewDialog: false,
      bookingPreview: null,
      previewLoading: false,
      previewError: null,

      confirmLoading: false,
      bookingDialog: false,
      bookingResponse: null,
    };
  },

  async created() {
    // read query params
    this.model_id = this.$route.query.modelId || null;
    this.total = parseFloat(this.$route.query.total || 0);
    this.pricing_id = this.$route.query.pricingId || null;
    this.vehicle_id = this.$route.query.vehicleId || null;
    this.subscription = this.$route.query.subscription || "N/A";

    try {
      this.addons = this.$route.query.addons
        ? JSON.parse(this.$route.query.addons)
        : [];
    } catch (e) {
      // if addons is a simple string or already array, normalize
      this.addons = this.$route.query.addons || [];
    }

    if (this.model_id) {
      await this.loadModel(this.model_id);
    }
  },

  methods: {
    async loadModel(modelId) {
      this.loading = true;
      try {
        const { data } = await api.get(`/api/vehicle-model/${modelId}`);
        this.model = data.data;
      } catch (err) {
        console.error("Error loading model:", err);
        this.$swal.fire("Error", "Failed to load vehicle details", "error");
      } finally {
        this.loading = false;
      }
    },

    populateCustomer(customer) {
      this.selectedCustomer = customer;
      if (customer) {
        this.form.name =
          customer.display_name || customer.name || this.form.name;
        const emailContact = customer.customer_contact_data?.find(
          (c) => c.type === "email" && c.is_primary
        );
        this.form.email = emailContact?.value || "";
        this.form.phone = customer.user_data?.phone || this.form.phone || "";
        this.form.address = customer.address || this.form.address || "";
      }
    },

    formatAmount(v) {
      if (v === null || v === undefined) return "0";
      const num = Number(v);
      if (Number.isNaN(num)) return v;
      return num.toLocaleString("en-IN");
    },

    // Build addons payload: accept various shapes
    buildAddonsPayload() {
      if (!this.addons || this.addons.length === 0) return [];
      return this.addons.map((a) => {
        // Keep it robust: if addon already contains provider_addon_id & qty, use it
        if (a.provider_addon_id)
          return { provider_addon_id: a.provider_addon_id, qty: a.qty || 1 };
        if (a.id) return { provider_addon_id: a.id, qty: a.qty || 1 };
        // fallback: if addon is primitive (string/number) we cannot map id -> send as-is is risky
        return {
          provider_addon_id: a.addonId || a.id || a.provider_addon_id || a,
          qty: 1,
        };
      });
    },

    // Preview booking call
    async previewBooking() {
      // validate form before preview
      this.triedToSubmit = true;
      const valid = await this.$refs.form.validate();
      if (!valid) return;

      // require pricing id
      if (!this.pricing_id) {
        this.$swal.fire(
          "Missing data",
          "Pricing ID is required to preview booking.",
          "warning"
        );
        return;
      }

      // ensure a customer is selected (backend expects customer_id mandatory for create; preview might not, but we enforce)
      if (!this.selectedCustomer) {
        // let user preview anyway? In this implementation, we require customer selection for consistent flow
        this.$swal.fire({
          title: "No customer selected",
          text: "Please select an existing customer before previewing the booking.",
          icon: "warning",
        });
        return;
      }

      this.previewLoading = true;
      this.globalLoading = true;
      this.previewError = null;
      this.bookingPreview = null;

      const payload = {
        pricing_id: this.pricing_id,
        addons: this.buildAddonsPayload(),
      };

      try {
        const { data } = await api.post("/api/booking/preview", payload);
        if (data?.success) {
          this.bookingPreview = data.data;
          this.previewDialog = true;
        } else {
          this.previewError =
            data?.message || "Failed to generate booking preview";
          this.$swal.fire("Preview Failed", this.previewError, "error");
        }
      } catch (err) {
        console.error("Preview error:", err);
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Network error during preview";
        this.previewError = message;
        this.$swal.fire("Preview Error", message, "error");
      } finally {
        this.previewLoading = false;
        this.globalLoading = false;
      }
    },

    closePreview() {
      this.previewDialog = false;
      this.bookingPreview = null;
      this.previewError = null;
    },

    // Confirm booking from preview dialog
    async confirmBookingFromPreview() {
      // quick guard: preview must exist
      if (!this.bookingPreview) {
        this.$swal.fire(
          "No preview",
          "Please generate a preview before confirming.",
          "warning"
        );
        return;
      }

      // ensure required data
      if (!this.selectedCustomer) {
        this.$swal.fire(
          "Missing customer",
          "Please select a customer before confirming booking.",
          "warning"
        );
        return;
      }

      this.confirmLoading = true;
      this.globalLoading = true;

      const payload = {
        pricing_id: this.pricing_id,
        customer_id: this.selectedCustomer?.customer_id,
        addons: this.buildAddonsPayload(),
        vehicle_id: this.vehicle_id || null,
      };

      try {
        const { data } = await api.post("/api/booking/v2", payload);

        if (data?.success) {
          this.bookingResponse = data.data;
          // close preview & open booking dialog
          this.previewDialog = false;
          this.bookingDialog = true;
        } else {
          const msg = data?.message || "Booking failed";
          this.$swal.fire("Booking Failed", msg, "error");
        }
      } catch (err) {
        console.error("Confirm booking error:", err);
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Network error creating booking";
        this.$swal.fire("Booking Error", message, "error");
      } finally {
        this.confirmLoading = false;
        this.globalLoading = false;
      }
    },

    closeBookingDialog() {
      this.bookingDialog = false;
      // optionally reset bookingResponse if you want to allow another booking
      // this.bookingResponse = null;
    },

    proceedToPayment() {
      // route to payment page with booking id and order id
      if (!this.bookingResponse) return;
      const bookingId = this.bookingResponse.booking.booking_id;
      // const orderId = this.bookingResponse.order.internal_order_id;
      this.$router.push({
        path: `/booking/${bookingId}/overview`,
        // query: {
        //   ...this.$route.query,
        //   bookingId,
        //   orderId,
        // },
      });
    },
  },
};
</script>

<style scoped>
.sticky-card {
  position: sticky;
  top: 20px;
}

.gap-2 > * {
  margin: 2px;
}
</style>
