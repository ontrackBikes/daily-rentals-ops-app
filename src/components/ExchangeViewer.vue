<template>
  <div>
    <!-- <div class="d-flex justify-space-between align-center mb-2">
      <div class="text-h6 font-weight-bold">Exchange Vehicle</div>
      <v-btn icon @click="$emit('close-modal')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div> -->
    <!-- Step 1: Select New Model -->
    <div v-if="step === 1">
      <select-model v-model="newModelSelected"></select-model>

      <div v-if="errorMessage" class="error--text mt-2">
        {{ errorMessage }}
      </div>

      <div class="text-right">
        <v-btn
          class="mt-4"
          color="primary"
          :loading="loading"
          :disabled="!newModelSelected"
          @click="checkExchange"
          rounded
          depressed
        >
          Check Exchange
        </v-btn>
      </div>
    </div>

    <!-- Step 2: Show Exchange Preview -->
    <div v-if="step === 2">
      <v-skeleton-loader
        v-if="loading"
        type="card"
        class="mb-4"
      ></v-skeleton-loader>

      <div v-else class="my-2">
        <!-- Available Vehicles -->
        <div v-if="exchangeData.availableVehiclesForExchange?.length">
          <h4 class="my-2">Select a Vehicle</h4>
          <v-select
            v-model="selectedVehicleId"
            :items="exchangeData.availableVehiclesForExchange"
            item-value="vehicle_id"
            item-text="registration_number"
            placeholder="Select a Vehicle"
            outlined
            dense
            hide-details="auto"
          ></v-select>
        </div>

        <div v-else class="error--text my-4 d-flex align-center">
          <v-icon color="red" size="18" class="mr-1">mdi-close-circle</v-icon>
          <h5>No vehicle available for exchange.</h5>
        </div>

        <!-- Summary Message -->
        <v-alert type="success" variant="tonal" class="my-4">
          {{ exchangeData.summary.message }}
        </v-alert>

        <!-- Price Difference -->
        <div>
          <v-card flat class="pa-2 grey lighten-2"
            ><div class="d-flex align-center justify-space-between">
              <h3>Price Difference</h3>
              <h3
                :class="{
                  'text-red-600': exchangeData.priceDifference < 0,
                  'text-green-600': exchangeData.priceDifference > 0,
                }"
              >
                ₹{{ exchangeData.priceDifference }}
              </h3>
            </div></v-card
          >
        </div>

        <!-- New Booking Line Items -->
        <div class="my-4">
          <h4 class="my-2">New Booking Line Items</h4>
          <v-card outlined>
            <v-simple-table dense>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in exchangeData.newBookingLineItems"
                  :key="item.product_name"
                >
                  <td>{{ item.product_name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>₹{{ item.unit_final_price }}</td>
                  <td>₹{{ item.net_total }}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card>
        </div>

        <!-- Booking Details -->
        <div class="my-4">
          <h4 class="my-2">Booking Details</h4>
          <v-card outlined class="pa-4">
            <v-simple-table dense>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Current</strong></td>
                  <td>
                    {{ formatDate(exchangeData.currentBooking.start_date) }}
                  </td>
                  <td>
                    {{ formatDate(exchangeData.currentBooking.end_date) }}
                  </td>
                </tr>
                <tr>
                  <td><strong>New</strong></td>
                  <td>
                    {{ formatDate(exchangeData.newBookingDetails.start_date) }}
                  </td>
                  <td>
                    {{ formatDate(exchangeData.newBookingDetails.end_date) }}
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card>
        </div>

        <!-- Summary -->
        <div class="my-4">
          <h4 class="my-2">Summary</h4>
          <v-card outlined class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <h4>Refund Amount:</h4>
              <h4>₹{{ exchangeData.summary.refundAmount }}</h4>
            </div>
            <div class="d-flex align-center justify-space-between">
              <h4>Additional Payment:</h4>
              <h4>₹{{ exchangeData.summary.additionalPayment }}</h4>
            </div>
          </v-card>
        </div>

        <div class="mt-4 text-right">
          <v-btn color="grey" class="mr-2" rounded depressed @click="step = 1"
            >Back</v-btn
          >
          <v-btn
            color="primary"
            :disabled="!selectedVehicleId"
            @click="confirmExchange"
            rounded
            depressed
          >
            Confirm Exchange
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SelectModel from "./SelectModel.vue";
import api from "@/plugins/axios";
import Swal from "sweetalert2";
import moment from "moment";

export default {
  components: { SelectModel },
  props: {
    booking_id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      newModelSelected: null,
      exchangeData: null,
      step: 1,
      errorMessage: null,
      loading: false,
      selectedVehicleId: null,
    };
  },
  methods: {
    async checkExchange() {
      if (!this.newModelSelected) return;
      this.loading = true;
      this.errorMessage = null;
      this.selectedVehicleId = null;

      try {
        const { data } = await api.post(`/api/vehicle/exchange-preview`, {
          booking_id: this.booking_id,
          new_model_id: this.newModelSelected.model_id,
        });
        if (data.success) {
          this.exchangeData = data.data;
          this.step = 2;
        } else {
          this.errorMessage = data.message || "Something went wrong";
        }
      } catch (err) {
        console.error(err);
        this.errorMessage =
          err.response?.data?.message || "Failed to fetch exchange preview";
        Swal.fire({
          title: "Error",
          text: this.errorMessage,
          icon: "error",
          confirmButtonColor: "#d33",
        });
      } finally {
        this.loading = false;
      }
    },
    async confirmExchange() {
      if (!this.selectedVehicleId) {
        Swal.fire(
          "Select Vehicle",
          "Please select a vehicle to proceed.",
          "warning"
        );
        return;
      }

      this.loading = true;
      try {
        const { data } = await api.post(`/api/vehicle/exchange`, {
          booking_id: this.booking_id,
          new_vehicle_id: this.selectedVehicleId,
        });

        if (data.success) {
          Swal.fire("Success", "Exchange confirmed successfully!", "success");
          // Optionally reload or redirect
          this.$emit("exchangeConfirmed", data.data);
          this.$emit("close-modal");
        } else {
          Swal.fire(
            "Error",
            data.message || "Failed to confirm exchange",
            "error"
          );
        }
      } catch (err) {
        console.error(err);
        Swal.fire(
          "Error",
          err.response?.data?.message || "Something went wrong",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      return moment(date).format("DD MMM YYYY");
    },
  },
};
</script>

<style scoped>
.error--text {
  color: red;
}
</style>
