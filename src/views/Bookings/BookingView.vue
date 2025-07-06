<template>
  <deep-layout>
    <v-container fluid>
      <v-row dense>
        <!-- LEFT: Booking Info -->
        <v-col cols="12" md="3">
          <v-skeleton-loader v-if="loading" type="card" />

          <v-card outlined v-if="!loading && booking" class="pa-4 rounded-lg">
            <!-- Status -->
            <div class="d-flex">
              <v-chip
                small
                color="orange"
                text-color="white"
                class="font-weight-medium"
              >
                {{ booking.status }}
              </v-chip>
            </div>

            <!-- Date Range -->
            <div class="text-subtitle-1 mt-2">
              {{ booking.start_date | moment("DD/MM/YYYY") }} -
              {{ booking.end_date | moment("DD/MM/YYYY") }}
            </div>

            <!-- Vehicle Number -->
            <div class="dark--text text--darken-2 font-weight-bold">
              {{ booking.vehicle_data?.registration_number }}
            </div>

            <!-- Source -->
            <div class="grey--text text--darken-1 mt-1 text-body-2">
              Source - {{ booking.source_type }}
            </div>

            <!-- Booking Date -->
            <div class="grey--text text--darken-1 text-body-2">
              {{ booking.created_at | moment("DD MMM YYYY") }}
            </div>

            <v-divider class="my-3" />

            <!-- Payment Status -->
            <div class="text-subtitle-2 font-weight-medium mb-1">
              Payment Status
            </div>
            <v-chip
              color="red"
              small
              text-color="white"
              class="font-weight-medium"
            >
              {{ booking.payment_status || "N/A" }}
            </v-chip>

            <!-- Upcoming → Show Start Booking -->
            <div
              v-if="booking.status === 'upcoming'"
              class="d-flex justify-end mt-4"
            >
              <v-btn color="primary" dark @click="openStartBookingDialog = true"
                >Start Booking</v-btn
              >
            </div>

            <!-- Active → Show End & Extend Booking -->
            <div
              v-if="booking.status === 'active'"
              class="d-flex justify-end mt-4"
            >
              <v-btn
                color="red"
                dark
                class="mr-2"
                @click="openEndBookingDialog = true"
                >End Booking</v-btn
              >
              <v-btn color="primary" dark @click="openExtendDialog = true"
                >Extend Booking</v-btn
              >
            </div>
          </v-card>
        </v-col>

        <!-- RIGHT: Tabs Section -->
        <v-col cols="12" md="9">
          <v-card flat>
            <v-tabs
              v-model="activeTab"
              background-color="transparent"
              grow
              show-arrows
              slider-color="primary"
            >
              <v-tab :key="'overview'" :to="`/booking/${booking_id}/overview`">
                Overview
              </v-tab>
              <v-tab :key="'payments'" :to="`/booking/${booking_id}/payments`">
                Payments
              </v-tab>
              <v-tab :key="'images'" :to="`/booking/${booking_id}/images`">
                Booking Images
              </v-tab>
              <v-tab :key="'vehicle'" :to="`/booking/${booking_id}/vehicle`">
                Vehicle Details
              </v-tab>
              <v-tab
                :key="'extensions'"
                :to="`/booking/${booking_id}/extensions`"
              >
                Extension Details
              </v-tab>
            </v-tabs>

            <!-- Dynamic tab content via nested routing -->
            <v-card flat>
              <router-view :booking="booking" />
            </v-card>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <div>
      <!-- Start Booking Dialog -->
      <v-dialog v-model="openStartBookingDialog" max-width="400px">
        <v-card :loading="loading">
          <v-container>
            <!-- Header -->
            <div class="d-flex justify-space-between align-center">
              <div class="text-h6 font-weight-bold">Start Booking</div>
              <v-btn icon @click="openStartBookingDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>

            <!-- Form -->
            <v-form ref="startForm" v-model="startFormValid" class="my-4">
              <label class="text-subtitle-2">
                Odometer Reading <span class="red--text">*</span>
              </label>
              <v-text-field
                v-model="startForm.odometer"
                type="number"
                outlined
                dense
                :rules="[rules.required, rules.numeric]"
                hide-details
              />
            </v-form>

            <!-- Actions -->
            <div class="d-flex justify-end my-2">
              <v-btn text @click="openStartBookingDialog = false" class="mr-2">
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                :disabled="!startFormValid"
                @click="submitStartBooking"
              >
                Confirm
              </v-btn>
            </div>
          </v-container>
        </v-card>
      </v-dialog>

      <!-- End Booking Dialog -->
      <v-dialog v-model="openEndBookingDialog" max-width="400px">
        <v-card :loading="loading">
          <v-container>
            <!-- Header -->
            <div class="d-flex justify-space-between align-center">
              <div class="text-h6 font-weight-bold">End Booking</div>
              <v-btn icon @click="openEndBookingDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>

            <!-- Form -->
            <v-form ref="endForm" v-model="endFormValid" class="my-4">
              <label class="text-subtitle-2"
                >Odometer Reading <span class="red--text">*</span></label
              >
              <v-text-field
                v-model="endForm.odometer"
                type="number"
                outlined
                dense
                :rules="[rules.required, rules.numeric]"
                hide-details
              />
            </v-form>

            <!-- Action -->
            <div class="d-flex justify-end my-2">
              <v-btn text @click="openEndBookingDialog = false" class="mr-2"
                >Cancel</v-btn
              >
              <v-btn
                color="primary"
                :disabled="!endFormValid"
                @click="submitEndBooking"
                >Confirm</v-btn
              >
            </div>
          </v-container>
        </v-card>
      </v-dialog>

      <!-- Extend Booking Dialog -->
      <v-dialog v-model="openExtendDialog" max-width="500px">
        <v-card>
          <v-container>
            <!-- Header -->
            <div class="d-flex justify-space-between align-center mb-2">
              <div class="text-h6 font-weight-bold">Extend Booking</div>
              <v-btn icon @click="openExtendDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>

            <!-- STEP 1: Select New End Date -->
            <div v-if="step === 1">
              <v-menu
                ref="menu"
                v-model="dateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="form.new_end_date"
                    label="Select New Date"
                    readonly
                    outlined
                    dense
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-date-picker
                  v-model="form.new_end_date"
                  :min="minDate"
                  @input="dateMenu = false"
                />
              </v-menu>

              <div class="mt-2">
                <v-btn color="primary" @click="fetchExtensionSummary"
                  >Confirm</v-btn
                >
              </div>
            </div>

            <!-- STEP 2: Show Extension Summary -->
            <div v-else-if="step === 2">
              <div class="mb-2 text-caption">
                {{ booking.end_date }} - {{ booking.new_end_date }}
              </div>

              <v-card outlined class="mb-3 pa-2">
                <div><strong>Extension Summary:</strong></div>
                <div v-for="(value, key) in summary" :key="key">
                  {{ key }}: ₹{{ value }}
                </div>
                <div class="font-weight-bold mt-1">
                  Total: ₹{{ totalAmount }}
                </div>
              </v-card>

              <div class="text-error" v-if="summaryError">
                Some error occurred
              </div>

              <v-btn color="primary" @click="createExtensionOrder"
                >Confirm</v-btn
              >
            </div>

            <!-- STEP 3: Extension Order Created -->
            <div v-else-if="step === 3">
              <div class="text-body-2 font-weight-bold">
                Extension Order Created
              </div>
              <div class="mb-2 text-caption">
                Please verify and update payment
              </div>
              <v-simple-table dense>
                <tbody>
                  <tr>
                    <td>Extension Order ID</td>
                    <td>{{ orderData.extension_id }}</td>
                  </tr>
                  <tr>
                    <td>Field</td>
                    <td>{{ orderData.value }}</td>
                  </tr>
                  <tr>
                    <td>Booking ID</td>
                    <td>{{ orderData.booking_id }}</td>
                  </tr>
                  <tr>
                    <td>Old End Date</td>
                    <td>{{ orderData.old_end_date }}</td>
                  </tr>
                  <tr>
                    <td>New End Date</td>
                    <td>{{ orderData.new_end_date }}</td>
                  </tr>
                  <tr>
                    <td>Total Amount</td>
                    <td>₹{{ orderData.total_amount }}</td>
                  </tr>
                  <tr>
                    <td>Status</td>
                    <td>{{ orderData.status }}</td>
                  </tr>
                </tbody>
              </v-simple-table>

              <v-btn color="primary" class="mt-2" @click="step = 4"
                >Update Payment</v-btn
              >
            </div>

            <!-- STEP 4: Update Payment -->
            <div v-else-if="step === 4">
              <v-select
                v-model="form.payment_status"
                :items="['paid', 'not_paid']"
                label="Payment Status"
                outlined
                dense
              />
              <v-select
                v-model="form.payment_gateway"
                :items="['Razorpay', 'Phonepe', 'GooglePay']"
                label="Payment Gateway"
                outlined
                dense
              />
              <v-text-field
                v-model="form.payment_method"
                label="Method"
                outlined
                dense
              />
              <v-text-field
                v-model="form.payment_amount"
                label="Amount"
                outlined
                dense
              />

              <v-btn color="primary" class="mt-2" @click="finalizePayment"
                >Confirm</v-btn
              >
            </div>

            <!-- STEP 5: Done -->
            <div v-else-if="step === 5" class="text-center">
              <v-icon color="green" size="48">mdi-check-circle-outline</v-icon>
              <div class="mt-2">Payment Captured</div>
              <v-btn color="primary" class="mt-2" @click="closeAll">Done</v-btn>
            </div>
          </v-container>
        </v-card>
      </v-dialog>
    </div>
  </deep-layout>
</template>

<script>
import api from "@/plugins/axios";
import Swal from "sweetalert2";
import DeepLayout from "@/Layouts/DeepLayout.vue";

export default {
  components: { DeepLayout },
  data() {
    return {
      booking_id: null,
      booking: {},
      loading: false,
      activeTab: null,

      openStartBookingDialog: false,
      startFormValid: false,
      startForm: {
        odometer: "",
      },

      openEndBookingDialog: false,
      menu: false,
      endFormValid: false,
      extendFormValid: false,
      endForm: {
        odometer: null,
      },
      extendForm: {
        newEndDate: null,
      },

      openExtendDialog: false,
      dateMenu: false,
      minDate: new Date().toISOString().substr(0, 10),
      step: 3,
      form: {
        new_end_date: null,
        payment_status: "",
        payment_gateway: "",
        payment_method: "",
        payment_amount: "",
      },
      summary: {},
      totalAmount: 0,
      summaryError: false,
      orderData: {},
      rules: {
        required: (v) => !!v || "Required",
        numeric: (v) => !isNaN(v) || "Must be a number",
      },
    };
  },
  watch: {
    // Keep activeTab synced with route
    "$route.path"(val) {
      this.activeTab = val;
    },
  },
  mounted() {
    this.booking_id = this.$route.params.booking_id;
    this.activeTab = this.$route.path;
    this.fetchBookingDetails();
  },
  methods: {
    async fetchBookingDetails() {
      this.loading = true;
      try {
        const { data } = await api.get(`/api/booking/${this.booking_id}`);
        this.booking = data.data || {};
      } catch (error) {
        console.error("Error loading booking:", error);
        Swal.fire({
          title: "Error",
          text:
            error.response?.data?.message || "Failed to load booking details",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      } finally {
        this.loading = false;
      }
    },

    async submitStartBooking() {
      if (!this.startFormValid) return;
      try {
        this.loading = true;
        await api.post("/api/booking/start", {
          booking_id: this.booking.booking_id,
          odometer: this.startForm.odometer,
        });
        this.$toast?.success("Booking started successfully");
        this.openStartBookingDialog = false;
      } catch (e) {
        this.$toast?.error("Error starting booking");
      } finally {
        this.loading = false;
      }
    },

    async submitEndBooking() {
      try {
        this.loading = true;
        await api.post("/api/booking/end", {
          booking_id: this.booking.booking_id,
          odometer: this.endForm.odometer,
        });
        this.$toast?.success("Booking ended successfully");
        this.openEndBookingDialog = false;
      } catch (e) {
        this.$toast?.error("Error ending booking");
      } finally {
        this.loading = false;
      }
    },

    closeAll() {
      this.openExtendDialog = false;
      this.step = 1;
    },

    async fetchExtensionSummary() {
      try {
        const { data } = await api.post("/api/bookings/extensions/summary", {
          booking_id: this.booking.booking_id,
          new_end_date: this.form.new_end_date,
        });
        this.summary = data.summary;
        this.totalAmount = data.total;
        this.step = 2;
      } catch (e) {
        this.summaryError = true;
      }
    },

    async createExtensionOrder() {
      try {
        const { data } = await api.post("/api/bookings/extensions", {
          booking_id: this.booking.booking_id,
          new_end_date: this.form.new_end_date,
        });
        this.orderData = data.extension;
        this.step = 3;
      } catch (e) {
        alert("Failed to create extension");
      }
    },

    async finalizePayment() {
      try {
        await api.post(
          `/api/bookings/extensions/${this.orderData.extension_id}/payment`,
          {
            status: this.form.payment_status,
            gateway: this.form.payment_gateway,
            method: this.form.payment_method,
            amount: this.form.payment_amount,
          }
        );
        this.step = 5;
      } catch (e) {
        alert("Some error occurred during payment");
      }
    },
  },
};
</script>
