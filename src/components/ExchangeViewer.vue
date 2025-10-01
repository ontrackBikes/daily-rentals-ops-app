<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-2">
      <div class="text-h6 font-weight-bold">Exchange Vehicle</div>
      <v-btn icon @click="$emit('close-modal')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <!-- Step 1: Select New Model -->
    <div v-if="step === 1">
      <select-model v-model="newModelSelected"></select-model>

      <div v-if="errorMessage" class="error--text mt-2">
        {{ errorMessage }}
      </div>

      <v-btn
        class="mt-4"
        color="primary"
        :loading="loading"
        :disabled="!newModelSelected"
        @click="checkExchange"
        rounded
      >
        Check Exchange
      </v-btn>
    </div>

    <!-- Step 2: Show Exchange Preview -->
    <div v-if="step === 2">
      <v-skeleton-loader
        v-if="loading"
        type="card"
        class="mb-4"
      ></v-skeleton-loader>

      <div v-else>
        <!-- Available Vehicles -->
        <v-card
          class="mb-4"
          outlined
          v-if="exchangeData.availableVehiclesForExchange?.length"
        >
          <v-card-title>Select a Vehicle</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedVehicleId"
              :items="exchangeData.availableVehiclesForExchange"
              item-value="vehicle_id"
              item-text="registration_number"
              label="Select a Vehicle"
              outlined
              dense
            ></v-select>
          </v-card-text>
        </v-card>

        <v-card v-else class="mb-4" outlined>
          <v-container>
            <div class="error--text">No vehicle available for exchange.</div>
          </v-container>
        </v-card>

        <!-- Summary Message -->
        <v-alert type="success" variant="outlined" class="mb-4">
          {{ exchangeData.summary.message }}
        </v-alert>

        <!-- Price Difference -->
        <v-card class="mb-4" outlined>
          <v-card-title>Price Difference</v-card-title>
          <v-card-text
            :class="{
              'text-red-600': exchangeData.priceDifference < 0,
              'text-green-600': exchangeData.priceDifference > 0,
            }"
          >
            ₹{{ exchangeData.priceDifference }}
          </v-card-text>
        </v-card>

        <!-- New Booking Line Items -->
        <v-card class="mb-4" outlined>
          <v-card-title>New Booking Line Items</v-card-title>
          <v-card-text>
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
          </v-card-text>
        </v-card>

        <!-- Booking Details -->
        <v-card class="mb-4" outlined>
          <v-card-title>Booking Details</v-card-title>
          <v-card-text>
            <p>
              <strong>Current:</strong>
              {{ exchangeData.currentBooking.start_date }} →
              {{ exchangeData.currentBooking.end_date }}
            </p>
            <p>
              <strong>New:</strong>
              {{ exchangeData.newBookingDetails.start_date }} →
              {{ exchangeData.newBookingDetails.end_date }}
            </p>
          </v-card-text>
        </v-card>

        <!-- Summary -->
        <v-card class="mb-4" outlined>
          <v-card-title>Summary</v-card-title>
          <v-card-text>
            <p>
              <strong>Refund Amount:</strong> ₹{{
                exchangeData.summary.refundAmount
              }}
            </p>
            <p>
              <strong>Additional Payment:</strong> ₹{{
                exchangeData.summary.additionalPayment
              }}
            </p>
          </v-card-text>
          <v-card-action>
            <v-btn color="grey" rounded @click="step = 1">Back</v-btn>
            <v-btn
              color="primary"
              :disabled="!selectedVehicleId"
              @click="confirmExchange"
              rounded
            >
              Confirm Exchange
            </v-btn>
          </v-card-action>
        </v-card>
      </div>
    </div>
  </v-container>
</template>

<script>
import SelectModel from "./SelectModel.vue";
import api from "@/plugins/axios";
import Swal from "sweetalert2";

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
  },
};
</script>

<style scoped>
.error--text {
  color: red;
}
</style>
