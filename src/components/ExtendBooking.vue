<template>
  <v-card class="pa-4">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-2">
      <v-card-title class="text-h6 font-weight-bold pa-0">
        Extend Booking
      </v-card-title>
      <v-btn icon @click="$emit('close-modal')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-divider />

    <!-- Stepper -->
    <v-stepper v-model="step" flat>
      <!-- Step Headers -->
      <v-stepper-header>
        <v-stepper-step :complete="step > 1" step="1"
          >Choose Plan</v-stepper-step
        >
        <v-divider></v-divider>
        <v-stepper-step :complete="step > 2" step="2">Preview</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="3">Confirm</v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <!-- Step 1: Choose Plan -->
        <v-stepper-content step="1">
          <div v-if="loadingPlans" class="text-center pa-4">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div v-else>
            <v-radio-group v-model="selectedPlan" column>
              <v-radio
                v-for="plan in plans"
                :key="plan.pricing_id"
                :label="`${
                  plan.model_pricing_plan_data.plan_name
                } - ₹${displayAmount(plan)}`"
                :value="plan.pricing_id"
              />
            </v-radio-group>
          </div>
          <v-btn
            color="primary"
            class="mt-3"
            :disabled="!selectedPlan"
            @click="goToPreview"
          >
            Next
          </v-btn>
        </v-stepper-content>

        <!-- Step 2: Preview -->
        <!-- Step 2: Preview -->
        <v-stepper-content step="2">
          <div v-if="previewing" class="text-center pa-4">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div v-else-if="preview">
            <v-alert type="info" class="mt-3">
              <div><strong>Extension Preview</strong></div>
              <div>
                Extra Days: {{ preview.extensionDetails.extension_days }}
              </div>
              <div>
                Total Payable: ₹{{
                  preview.pricingBreakdown.totalExtensionAmount
                }}
              </div>
              <div>Plan: {{ preview.modelDetails.plan_name }}</div>
              <div>
                New End Date:
                {{
                  new Date(
                    preview.extensionDetails.new_end_date
                  ).toLocaleString()
                }}
              </div>
            </v-alert>
          </div>
          <v-btn text class="mt-3" @click="step = 1">Back</v-btn>
          <v-btn
            color="primary"
            class="mt-3"
            :disabled="!preview"
            @click="step = 3"
          >
            Continue
          </v-btn>
        </v-stepper-content>

        <!-- Step 3: Confirm -->
        <v-stepper-content step="3">
          <v-alert type="success" outlined class="mb-4">
            You are about to extend this booking.
          </v-alert>
          <v-btn text @click="step = 2">Back</v-btn>
          <v-btn color="success" :loading="confirming" @click="extendBooking">
            Confirm Extension
          </v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-card>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "ExtendBooking",
  props: {
    booking: { type: String, required: true },
  },
  data() {
    return {
      booking_id: null,
      model_id: null,
      step: 1,
      plans: [],
      selectedPlan: null,
      preview: null,
      loadingPlans: false,
      previewing: false,
      confirming: false,
    };
  },
  created() {
    this.booking_id = this.booking.booking_id;
    this.model_id = this.booking.model_id;
    this.selectedPlan = this.booking.pricing_id;
    this.fetchPlans();
  },
  methods: {
    async fetchPlans() {
      this.loadingPlans = true;
      try {
        const res = await api.get(`/api/vehicle-model/${this.model_id}`);
        this.plans = res.data?.data.vehicle_model_pricing_data || [];
      } catch (err) {
        console.error("Error fetching plans", err);
      } finally {
        this.loadingPlans = false;
      }
    },
    async goToPreview() {
      this.previewing = true;
      this.step = 2;
      try {
        const res = await api.post(
          `/api/booking/${this.booking_id}/extension/preview`,
          { pricing_id: this.selectedPlan }
        );
        this.preview = res.data?.data;
      } catch (err) {
        console.error("Error previewing extension", err);
      } finally {
        this.previewing = false;
      }
    },
    async extendBooking() {
      this.confirming = true;
      try {
        await api.post(`/api/booking/${this.booking_id}/extend`, {
          pricing_id: this.selectedPlan,
        });
        this.$emit("extendConfirmed"); // ✅ notify parent
        this.$emit("close-modal"); // ✅ close the modal/dialog
      } catch (err) {
        console.error("Error extending booking", err);
      } finally {
        this.confirming = false;
      }
    },
    displayAmount(plan) {
      const offer = parseFloat(plan.offer_rate);
      const base = parseFloat(plan.base_rate);
      return offer > 0 ? offer : base;
    },
  },
};
</script>

<style scoped></style>
