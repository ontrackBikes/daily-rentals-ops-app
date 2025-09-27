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
              {{ booking.order_data?.payment_status || "N/A" }}
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
              <v-btn color="primary" dark @click="openExtendDialog = true">
                Extend Booking
              </v-btn>

              <extend-booking-viewer
                v-model="openExtendDialog"
                :booking_id="booking_id"
                @confirm="handleConfirm"
                @error="showError"
              />
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

    <v-dialog v-model="openStartBookingDialog" max-width="700px">
      <v-card :loading="loading">
        <v-container>
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Start Booking</div>
            <v-btn icon @click="closeStartBookingDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-form ref="startFormRef" v-model="startFormValid" class="my-4">
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

            <label class="text-subtitle-2 mt-3">
              Booking Images (Min 4 required)
            </label>
            <v-row dense>
              <v-col
                v-for="(img, index) in startImages"
                :key="index"
                cols="6"
                sm="3"
              >
                <v-img
                  :src="img.preview || img.image_url"
                  aspect-ratio="1"
                  class="rounded-lg elevation-1"
                  contain
                />
                <div
                  class="text-caption mt-1 text-center grey--text text--darken-1"
                >
                  {{ img.type || "pickup" }}
                </div>
                <v-btn
                  small
                  color="red"
                  class="mt-1"
                  @click="removeImage('start', index)"
                >
                  Remove
                </v-btn>
              </v-col>

              <v-col cols="6" sm="3">
                <div
                  class="d-flex flex-column align-center justify-center grey lighten-3 rounded-lg"
                  style="height: 100px; cursor: pointer"
                  @click="triggerImageUpload('start')"
                >
                  <v-icon size="36" color="grey darken-1"
                    >mdi-plus-circle-outline</v-icon
                  >
                  <span class="mt-1 text-caption grey--text text--darken-1"
                    >Add Image</span
                  >
                </div>
              </v-col>
            </v-row>
          </v-form>

          <div class="d-flex justify-end my-2">
            <v-btn text @click="closeStartBookingDialog" class="mr-2"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              :disabled="!startFormValid || startImages.length < 4"
              @click="submitStartBooking"
            >
              Confirm
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog v-model="openEndBookingDialog" max-width="700px">
      <v-card :loading="loading">
        <v-container>
          Header
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">End Booking</div>
            <v-btn icon @click="closeEndBookingDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-form ref="endFormRef" v-model="endFormValid" class="my-4">
            <label class="text-subtitle-2">
              Odometer Reading <span class="red--text">*</span>
            </label>
            <v-text-field
              v-model="endForm.odometer"
              type="number"
              outlined
              dense
              :rules="[rules.required, rules.numeric]"
              hide-details
            />

            <label class="text-subtitle-2 mt-3">
              Booking Images (Min 4 required)
            </label>
            <v-row dense>
              <v-col
                v-for="(img, index) in endImages"
                :key="index"
                cols="6"
                sm="3"
              >
                <v-img
                  :src="img.preview || img.image_url"
                  aspect-ratio="1"
                  class="rounded-lg elevation-1"
                  contain
                />
                <div
                  class="text-caption mt-1 text-center grey--text text--darken-1"
                >
                  {{ img.type || "drop" }}
                </div>
                <!-- <v-btn
                  small
                  color="red"
                  class="mt-1"
                  @click="removeImage('end', index)"
                >
                  Remove
                </v-btn> -->
              </v-col>

              <v-col cols="6" sm="3">
                <div
                  class="d-flex flex-column align-center justify-center grey lighten-3 rounded-lg"
                  style="height: 100px; cursor: pointer"
                  @click="triggerImageUpload('end')"
                >
                  <v-icon size="36" color="grey darken-1"
                    >mdi-plus-circle-outline</v-icon
                  >
                  <span class="mt-1 text-caption grey--text text--darken-1"
                    >Add Image</span
                  >
                </div>
              </v-col>
            </v-row>
          </v-form>

          <div class="d-flex justify-end my-2">
            <v-btn text @click="closeEndBookingDialog" class="mr-2"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              :disabled="!endFormValid || endImages.length < 4"
              @click="submitEndBooking"
            >
              Confirm
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <!-- <v-dialog v-model="openExtendDialog" max-width="500px">
      <v-card>
        <v-container>

          <div class="d-flex justify-space-between align-center mb-2">
            <div class="text-h6 font-weight-bold">Extend Booking</div>
            <v-btn icon @click="openExtendDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

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

          <div v-else-if="step === 2">
            <div class="mb-2 text-caption">
              {{ booking.end_date }} - {{ booking.new_end_date }}
            </div>

            <v-card outlined class="mb-3 pa-2">
              <div><strong>Extension Summary:</strong></div>
              <div v-for="(value, key) in summary" :key="key">
                {{ key }}: ₹{{ value }}
              </div>
              <div class="font-weight-bold mt-1">Total: ₹{{ totalAmount }}</div>
            </v-card>

            <div class="text-error" v-if="summaryError">
              Some error occurred
            </div>

            <v-btn color="primary" @click="createExtensionOrder">Confirm</v-btn>
          </div>

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

          <div v-else-if="step === 5" class="text-center">
            <v-icon color="green" size="48">mdi-check-circle-outline</v-icon>
            <div class="mt-2">Payment Captured</div>
            <v-btn color="primary" class="mt-2" @click="closeAll">Done</v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog> -->

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="handleImageUpload"
    />
  </deep-layout>
</template>

<script>
import api from "@/plugins/axios";
import Swal from "sweetalert2";
import DeepLayout from "@/Layouts/DeepLayout.vue";
import ExtendBookingViewer from "@/components/ExtendBookingViewer.vue";

export default {
  components: { DeepLayout, ExtendBookingViewer },
  data() {
    return {
      booking_id: null,
      booking: {},
      loading: false,
      activeTab: null,

      // Start Booking
      openStartBookingDialog: false,
      startFormValid: false,
      startForm: {
        odometer: "",
      },
      startImages: [],

      // End Booking
      openEndBookingDialog: false,
      endFormValid: false,
      endForm: {
        odometer: null,
      },
      endImages: [],

      // Extend Booking
      lineItems: [],
      extendForm: {
        plan: null,
        customEndDate: null,
      },

      // Image upload
      currentUploadType: null, // 'start' or 'end'

      menu: false,
      extendFormValid: false,
      // extendForm: {
      //   newEndDate: null,
      // },
      openExtendDialog: false,
      dateMenu: false,
      minDate: new Date().toISOString().substr(0, 10),
      step: 1,

      summary: {},
      totalAmount: 0,
      summaryError: false,
      orderData: {},
      form: {
        new_end_date: null,
        payment_status: "",
        payment_gateway: "",
        payment_method: "",
        payment_amount: "",
      },
      bookingImages: [],
      rules: {
        required: (v) => !!v || "Required",
        numeric: (v) => !isNaN(v) || "Must be a number",
      },
    };
  },

  watch: {
    "$route.path"(val) {
      this.activeTab = val;
    },
    openStartBookingDialog(val) {
      if (val) this.fetchBookingImages();
    },
    openEndBookingDialog(val) {
      if (val) this.fetchBookingImages();
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

    async fetchBookingImages() {
      if (!this.booking?.booking_id) return;
      try {
        const res = await api.get(
          `/api/bookings/${this.booking.booking_id}/images`
        );
        this.bookingImages = res.data.images || [];

        // Split images between start/end based on type
        this.startImages = this.bookingImages.filter(
          (img) => img.type === "pickup"
        );
        this.endImages = this.bookingImages.filter(
          (img) => img.type === "drop"
        );
      } catch (err) {
        console.error("Failed to fetch booking images:", err);
        this.bookingImages = [];
        this.startImages = [];
        this.endImages = [];
      }
    },

    triggerImageUpload(type) {
      this.currentUploadType = type;
      this.$refs.fileInput.click();
    },

    async handleImageUpload(event) {
      const files = Array.from(event.target.files);
      if (!files.length || !this.currentUploadType) return;

      this.loading = true;

      try {
        for (const file of files) {
          // Create preview URL
          const preview = URL.createObjectURL(file);

          // Create FormData for API upload
          const formData = new FormData();
          formData.append("booking_id", this.booking.booking_id);
          formData.append(
            "type",
            this.currentUploadType === "start" ? "pickup" : "drop"
          );
          formData.append("image", file, file.name);

          // Upload to API
          const res = await api.post("/api/bookings/upload-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          // Add to appropriate array with preview
          const newImg = {
            image_url: res.data.image_url || preview,
            preview: preview,
            type: this.currentUploadType === "start" ? "pickup" : "drop",
            file: file,
          };

          if (this.currentUploadType === "start") {
            this.startImages.push(newImg);
          } else if (this.currentUploadType === "end") {
            this.endImages.push(newImg);
          }
        }

        this.$swal.fire({
          icon: "success",
          title: "Images uploaded successfully!",
          text: `${files.length} image(s) uploaded`,
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
      } catch (err) {
        console.error("Upload failed:", err);
        this.$swal.fire({
          icon: "error",
          title: "Upload failed!",
          text: err.response?.data?.message || "Failed to upload images",
        });
      } finally {
        this.loading = false;
        // Reset file input
        event.target.value = "";
        this.currentUploadType = null;
      }
    },

    // removeImage(type, index) {
    //   if (type === "start") {
    //     // Revoke preview URL to prevent memory leaks
    //     if (this.startImages[index].preview) {
    //       URL.revokeObjectURL(this.startImages[index].preview);
    //     }
    //     this.startImages.splice(index, 1);
    //   } else if (type === "end") {
    //     if (this.endImages[index].preview) {
    //       URL.revokeObjectURL(this.endImages[index].preview);
    //     }
    //     this.endImages.splice(index, 1);
    //   }
    // },

    closeStartBookingDialog() {
      this.openStartBookingDialog = false;
      this.startForm = { odometer: "" };
      // Clean up preview URLs
      this.startImages.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
      this.startImages = [];
    },

    closeEndBookingDialog() {
      this.openEndBookingDialog = false;
      this.endForm = { odometer: null };
      // Clean up preview URLs
      this.endImages.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
      this.endImages = [];
    },

    async submitStartBooking() {
      if (!this.startFormValid || this.startImages.length < 4) return;

      this.loading = true;
      try {
        const resp = await api.post("/api/booking/start", {
          booking_id: this.booking.booking_id,
          pre_odometer_reading: this.startForm.odometer,
        });

        this.$swal.fire({
          icon: "success",
          title: "Started",
          text: resp.data.message,
        });

        this.closeStartBookingDialog();
        this.fetchBookingDetails(); // Refresh booking data
      } catch (e) {
        this.$swal.fire({
          icon: "error",
          title: "Error",
          text: e.response?.data?.message || "Some error occurred!",
        });
      } finally {
        this.loading = false;
      }
    },

    async submitEndBooking() {
      if (!this.endFormValid || this.endImages.length < 4) return;

      this.loading = true;
      try {
        await api.post("/api/booking/end", {
          booking_id: this.booking.booking_id,
          odometer: this.endForm.odometer,
        });

        this.$swal.fire({
          icon: "success",
          title: "Ended",
          text: "Booking ended successfully",
        });

        this.closeEndBookingDialog();
        this.fetchBookingDetails(); // Refresh booking data
      } catch (e) {
        this.$swal.fire({
          icon: "error",
          title: "Error",
          text: e.response?.data?.message || "Error ending booking",
        });
      } finally {
        this.loading = false;
      }
    },

    closeAll() {
      this.openExtendDialog = false;
      this.step = 1;
    },

    confirmExtension() {
      if (!this.extendForm.plan && !this.extendForm.customEndDate) {
        this.$toast.error("Please select a plan or custom end date");
        return;
      }
      console.log("Selected Plan:", this.form.plan);
      console.log("Custom End Date:", this.form.customEndDate);
      // Call API to confirm extension here
      this.openExtendDialog = false;
    },

    // async fetchExtensionSummary() {
    //   try {
    //     const { data } = await api.post("/api/bookings/extensions/summary", {
    //       booking_id: this.booking.booking_id,
    //       new_end_date: this.form.new_end_date,
    //     });
    //     this.summary = data.summary;
    //     this.totalAmount = data.total;
    //     this.step = 2;
    //   } catch (e) {
    //     this.summaryError = true;
    //   }
    // },

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

  beforeDestroy() {
    // Clean up any remaining preview URLs
    [...this.startImages, ...this.endImages].forEach((img) => {
      if (img.preview) URL.revokeObjectURL(img.preview);
    });
  },
};
</script>
