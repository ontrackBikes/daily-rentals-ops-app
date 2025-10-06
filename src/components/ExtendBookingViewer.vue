<template>
  <v-dialog v-model="internalDialog" max-width="800px">
    <v-card>
      <v-card-title>
        <span class="headline">Extend Booking</span>
      </v-card-title>
      <v-divider />

      <!-- Loader Overlay -->
      <v-overlay absolute :value="loading">
        <v-progress-circular indeterminate color="primary" size="64" />
      </v-overlay>

      <v-card-text>
        <!-- Error -->
        <v-alert v-if="error" type="error" dense outlined class="mb-4">
          {{ error }}
        </v-alert>

        <!-- Plans -->
        <v-form v-if="!loading && !error" ref="extendForm">
          <h4 class="mt-4 mb-2">Select Your Plan</h4>
          <v-radio-group v-model="form.pricing_id">
            <v-row dense>
              <v-col
                cols="12"
                md="6"
                v-for="item in lineItems"
                :key="item.pricing_id"
              >
                <v-card
                  outlined
                  class="cursor-pointer rounded-lg hover-elevate"
                  :class="{
                    'border-primary': form.pricing_id === item.pricing_id,
                  }"
                  @click="selectPlan(item)"
                >
                  <v-card-text class="pa-4">
                    <!-- Radio + Title -->
                    <div class="d-flex align-center mb-3">
                      <v-radio
                        :value="item.pricing_id"
                        color="primary"
                        class="mr-3"
                      />
                      <div>
                        <h3 class="subtitle-1 font-weight-bold">
                          {{ item.model_pricing_plan_data.plan_name }}
                        </h3>
                        <p class="caption text--secondary mb-0">
                          {{ item.model_pricing_plan_data.plan_type }} • ₹{{
                            item.offer_rate
                          }}
                        </p>
                      </div>
                    </div>

                    <!-- Plan Info -->
                    <v-divider class="my-3" />
                    <span class="caption text--secondary">
                      {{ item.model_pricing_plan_data.plan_description }}
                    </span>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-radio-group>
        </v-form>

        <!-- Extension Preview -->
        <v-expand-transition>
          <div v-if="previewData" class="mt-6">
            <h4 class="mb-3">Extension Preview</h4>
            <v-card outlined>
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>Current End Date</v-list-item-content>
                  <v-list-item-content class="text-right">
                    {{
                      formatDate(previewData.currentBooking.current_end_date)
                    }}
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>New End Date</v-list-item-content>
                  <v-list-item-content class="text-right">
                    {{ formatDate(previewData.extensionDetails.new_end_date) }}
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>Extension Days</v-list-item-content>
                  <v-list-item-content class="text-right">
                    {{ previewData.extensionDetails.extension_days }}
                  </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item>
                  <v-list-item-content>Total Amount</v-list-item-content>
                  <v-list-item-content class="text-right font-weight-bold">
                    ₹{{ previewData.pricingBreakdown.totalExtensionAmount }}
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </div>
        </v-expand-transition>
      </v-card-text>

      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn rounded text @click="closeDialog">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="!form.pricing_id || !previewData"
          rounded
          @click="confirm"
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-dialog>
</template>

<script>
import api from "@/plugins/axios";
import moment from "moment";
import Swal from "sweetalert2";

export default {
  name: "ExtendBookingDialog",
  props: {
    value: { type: Boolean, default: false },
    booking_id: { type: [String, Number], required: true },
    model_id: { type: [String, Number], required: false },
  },
  data() {
    return {
      internalDialog: this.value,
      loading: false,
      error: null,
      lineItems: [],
      previewData: null,
      form: {
        pricing_id: null,
      },
      snackbar: {
        show: false,
        message: "",
        color: "error",
      },
    };
  },
  watch: {
    value(val) {
      this.internalDialog = val;
      if (val) {
        this.fetchPlans();
      }
    },
    internalDialog(val) {
      this.$emit("input", val);
    },
  },
  methods: {
    async fetchPlans() {
      this.error = null;
      this.lineItems = [];
      if (!this.model_id) {
        this.error = "Model ID missing.";
        return;
      }
      this.loading = true;
      try {
        const res = await api.get(`/api/vehicle-model/${this.model_id}`);
        if (res.data.success) {
          this.lineItems = res.data.data.vehicle_model_pricing_data || [];
        } else {
          this.error = "Failed to load extension plans.";
        }
      } catch (err) {
        console.error("API error:", err);
        this.error = "Unable to fetch extension plans.";
      } finally {
        this.loading = false;
      }
    },
    async selectPlan(item) {
      this.form.pricing_id = item.pricing_id;
      this.previewData = null;
      try {
        const res = await api.post(
          `/api/booking/${this.booking_id}/extension/preview`,
          { pricing_id: item.pricing_id }
        );
        if (res.data.success) {
          this.previewData = res.data.data;
        } else {
          this.showSnackbar("Failed to generate preview");
        }
      } catch (err) {
        console.error("Preview error:", err);
        this.showSnackbar("Unable to generate preview");
      }
    },

    async confirm() {
      if (!this.form.pricing_id) {
        this.showSnackbar("Please select a plan");
        return;
      }
      try {
        const res = await api.post(`/api/booking/${this.booking_id}/extend`, {
          pricing_id: this.form.pricing_id,
        });

        if (res.data.success) {
          // SweetAlert success message
          await Swal.fire({
            title: "Success!",
            text: "Booking extended successfully.",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#1976d2",
          });

          this.showSnackbar("Booking extended successfully", "success");
          this.$emit("confirmed", res.data.data);
          this.closeDialog();
        } else {
          this.showSnackbar("Failed to extend booking");
          Swal.fire({
            title: "Failed",
            text: "Unable to extend booking.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#d32f2f",
          });
        }
      } catch (err) {
        console.error("Extend error:", err);
        this.showSnackbar("Unable to extend booking");
        Swal.fire({
          title: "Error",
          text: "Something went wrong while extending the booking.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#d32f2f",
        });
      }
    },

    closeDialog() {
      this.internalDialog = false;
    },
    showSnackbar(message, color = "error") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    formatDate(date) {
      return moment(date).format("DD MMM YYYY");
    },
  },
};
</script>

<style scoped>
.hover-elevate:hover {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.12);
}
.border-primary {
  border: 2px solid #1976d2 !important;
}
</style>
