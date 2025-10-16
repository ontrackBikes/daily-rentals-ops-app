<template>
  <v-card v-if="model" flat class="pa-6 elevation-1">
    <!-- Optional Header Actions -->
    <div class="d-flex justify-space-between align-center mb-4">
      <!-- You can add edit button here if needed -->
    </div>

    <!-- Specifications -->
    <section class="mb-6">
      <h3 class="font-weight-bold mb-3">Specifications</h3>
      <v-row dense>
        <v-col cols="12" sm="6" lg="4">
          <strong>Body Type:</strong> {{ model.body_type || "N/A" }}
        </v-col>
        <v-col cols="12" sm="6" lg="4">
          <strong>Vehicle Type:</strong> {{ model.vehicle_type || "N/A" }}
        </v-col>
        <v-col cols="12" sm="6" lg="4">
          <strong>Start Type:</strong> {{ model.start_type || "N/A" }}
        </v-col>
        <v-col cols="12" sm="6" lg="4" v-if="model.fuel_capacity">
          <strong>Fuel Capacity:</strong> {{ model.fuel_capacity }} L
        </v-col>
        <v-col cols="12" sm="6" lg="4" v-if="model.battery_capacity">
          <strong>Battery Capacity:</strong> {{ model.battery_capacity }} kWh
        </v-col>
        <v-col cols="12" sm="6" lg="4" v-if="model.range_km">
          <strong>Range:</strong> {{ model.range_km }} km
        </v-col>
        <v-col cols="12" sm="6" lg="4">
          <strong>Year:</strong> {{ model.year || "N/A" }}
        </v-col>
        <v-col cols="12" sm="6" lg="4">
          <strong>Make:</strong> {{ model.make || "N/A" }}
        </v-col>
        <v-col cols="12" sm="6" lg="4">
          <strong>Seat Capacity:</strong> {{ model.seat_capacity || "N/A" }}
        </v-col>
      </v-row>
    </section>

    <!-- Plans Section -->
    <section class="mb-6">
      <div class="d-flex justify-space-between align-center mb-3">
        <h3 class="font-weight-bold">
          Pricing ({{ model.vehicle_model_pricing_data?.length || 0 }})
        </h3>
        <v-btn
          color="primary"
          rounded
          depressed
          small
          @click="openAddPlanDialog"
        >
          <v-icon left>mdi-plus</v-icon>
          Add Plan
        </v-btn>
      </div>

      <!-- Pricing Cards -->
      <v-row
        v-if="
          model.vehicle_model_pricing_data &&
          model.vehicle_model_pricing_data.length
        "
        class="gy-4"
      >
        <v-col
          v-for="plan in model.vehicle_model_pricing_data"
          :key="plan.pricing_id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card outlined class="pa-4 rounded-xl elevation-0">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="font-weight-bold">
                {{ plan.model_pricing_plan_data.plan_name }}
              </span>

              <div class="d-flex align-center">
                <!-- Active / Inactive Status -->
                <v-chip
                  x-small
                  :color="plan.is_active ? 'green' : 'red'"
                  dark
                  class="mr-2"
                >
                  {{ plan.is_active ? "Active" : "Inactive" }}
                </v-chip>

                <!-- Plan Type -->
                <v-chip small color="primary" outlined>
                  {{ plan.model_pricing_plan_data.plan_type }}
                </v-chip>

                <!-- Edit Button -->
                <v-btn icon small @click="openEditDialog(plan.pricing_id)">
                  <v-icon small>mdi-pencil</v-icon>
                </v-btn>
              </div>
            </div>

            <div class="my-2">
              <span class="font-weight-bold">Price:</span>
              <span
                v-if="
                  plan.offer_rate &&
                  Number(plan.offer_rate) < Number(plan.base_rate)
                "
              >
                <s class="grey--text"
                  >₹{{ Number(plan.base_rate).toLocaleString() }}</s
                >
                <span class="ml-2 red--text font-weight-bold">
                  ₹{{ Number(plan.offer_rate).toLocaleString() }}
                </span>
                <v-chip x-small color="green lighten-1" dark class="ml-2"
                  >Offer</v-chip
                >
              </span>
              <span v-else>
                <span class="primary--text font-weight-bold">
                  ₹{{ Number(plan.base_rate).toLocaleString() }}
                </span>
              </span>
            </div>

            <v-simple-table dense>
              <tbody>
                <tr>
                  <td>KM Cap</td>
                  <td>{{ plan.model_pricing_plan_data.km_cap }} km</td>
                </tr>
                <tr>
                  <td>Extra KM</td>
                  <td>₹{{ plan.model_pricing_plan_data.extra_km_rate }}</td>
                </tr>
                <tr>
                  <td>Deposit</td>
                  <td>
                    ₹{{
                      Number(
                        plan.model_pricing_plan_data.security_deposit
                      ).toLocaleString()
                    }}
                  </td>
                </tr>
              </tbody>
            </v-simple-table>

            <div
              v-if="plan.model_pricing_plan_data.plan_description"
              class="mt-2 text-caption grey--text text--darken-1"
            >
              {{ plan.model_pricing_plan_data.plan_description }}
            </div>
          </v-card>
        </v-col>
      </v-row>
      <v-alert type="info" outlined v-else>
        Pricing information is not available for this model.
      </v-alert>

      <!-- Add/Edit Plan Dialog -->
      <v-dialog v-model="planDialog" max-width="600px">
        <v-card :loading="loading">
          <v-container>
            <div class="d-flex justify-space-between align-center mb-2">
              <div class="text-h6 font-weight-bold">
                {{ dialogMode === "add" ? "Add Plan" : "Edit Pricing" }}
              </div>
              <v-btn icon @click="closePlanDialog"
                ><v-icon>mdi-close</v-icon></v-btn
              >
            </div>

            <v-form ref="form" v-model="formValid" class="my-4">
              <!-- Show select only for add mode -->
              <div v-if="dialogMode === 'add'">
                <label class="text-subtitle-2">
                  Select Plan <span class="red--text">*</span>
                </label>
                <div class="mb-3">
                  <v-select
                    v-model="selectedPlanId"
                    :items="plans"
                    item-text="plan_name"
                    item-value="plan_id"
                    outlined
                    dense
                    :rules="[rules.required]"
                    hide-details
                    placeholder="Choose a plan"
                    required
                  />
                </div>
              </div>

              <!-- Base Rate -->
              <label class="text-subtitle-2">
                Base Rate <span class="red--text">*</span>
              </label>
              <div class="mb-3">
                <v-text-field
                  v-model.number="baseRate"
                  type="number"
                  outlined
                  dense
                  :rules="[rules.required, rules.positive]"
                  required
                  hide-details
                />
              </div>

              <!-- Offer Rate -->
              <label class="text-subtitle-2">
                Offer Rate <span class="red--text">*</span>
              </label>
              <div class="mb-3">
                <v-text-field
                  v-model.number="offerRate"
                  type="number"
                  outlined
                  dense
                  :rules="[rules.required, rules.positive]"
                  required
                  hide-details
                />
              </div>

              <!-- Status -->
              <div class="mt-2">
                <v-switch v-model="isActive" label="Active" color="success" />
              </div>
            </v-form>

            <!-- Actions -->
            <div class="d-flex justify-end mt-3">
              <v-btn
                text
                rounded
                depressed
                class="mr-2"
                @click="closePlanDialog"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                rounded
                depressed
                :disabled="!formValid"
                @click="
                  dialogMode === 'add' ? addPlanToModel() : updatePricing()
                "
              >
                {{ dialogMode === "add" ? "Add" : "Update" }}
              </v-btn>
            </div>
          </v-container>
        </v-card>
      </v-dialog>
    </section>

    <!-- Description -->
    <section>
      <h3 class="font-weight-bold mb-3">Description</h3>
      <p class="text-body-2 mb-0" v-if="model.description">
        {{ model.description }}
      </p>
      <p class="text-body-2 mb-0 grey--text text--darken-1" v-else>
        No description provided for this vehicle model.
      </p>
    </section>
  </v-card>
  <v-skeleton-loader v-else type="article" />
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "ModelOverview",

  props: {
    model: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  data() {
    return {
      planDialog: false,
      dialogMode: "add",
      plans: [],
      selectedPlanId: null,
      baseRate: null,
      offerRate: null,
      isActive: true,
      formValid: false,

      loading: false,
      rules: {
        required: (v) => !!v || "Required.",
        positive: (v) => v > 0 || "Must be greater than 0",
      },
    };
  },
  methods: {
    // Open Add Dialog
    openAddPlanDialog() {
      this.dialogMode = "add";
      this.resetForm();
      this.fetchPlans();
      this.planDialog = true;
    },

    // Open Edit Dialog
    async openEditDialog(pricingId) {
      this.dialogMode = "edit";
      this.resetForm();
      this.currentPricingId = pricingId;
      this.planDialog = true;
      await this.fetchPricingDetails(pricingId);
    },
    closePlanDialog() {
      this.planDialog = false;
      this.resetForm();
    },

    resetForm() {
      this.selectedPlanId = null;
      this.baseRate = null;
      this.offerRate = null;
      this.isActive = true;
      this.formValid = false;
      this.currentPricingId = null;
    },
    async fetchPlans() {
      try {
        this.loading = true;
        const { data } = await api.get("/api/plans", {
          params: { limit: 50, offset: 0 },
        });
        this.plans = data?.data?.plans || [];
      } catch (err) {
        this.$swal.fire("Error", "Failed to fetch plans", "error");
      } finally {
        this.loading = false;
      }
    },

    async fetchPricingDetails(pricingId) {
      try {
        this.loading = true;
        const { data } = await api.get(`/api/model-pricing/${pricingId}`);
        const pricing = data?.data || {};
        this.baseRate = pricing.base_rate;
        this.offerRate = pricing.offer_rate;
        this.isActive = pricing.is_active;
      } catch (err) {
        this.$swal.fire("Error", "Failed to fetch pricing", "error");
      } finally {
        this.loading = false;
      }
    },

    async addPlanToModel() {
      if (!this.model || !this.model.model_id) {
        this.$swal.fire("Error", "Model data is not loaded yet.", "error");
        return;
      }
      if (!this.$refs.form.validate()) return;

      this.loading = true;
      try {
        await api.post(`/api/vehicle-model/${this.model.model_id}/add-plan`, {
          plan_id: this.selectedPlanId,
          base_rate: this.baseRate,
          offer_rate: this.offerRate,
          is_active: this.isActive,
          model_status: "active",
        });
        this.$swal.fire("Success", "Plan added successfully!", "success");
        this.closePlanDialog();
        this.$emit("refresh-model");
      } catch (err) {
        this.$swal.fire(
          "Error",
          err.response?.data?.message || "Failed to add plan",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },

    async updatePricing() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      try {
        await api.put(
          `/api/model-pricing/${this.currentPricingId}/update-details`,
          {
            base_rate: this.baseRate,
            offer_rate: this.offerRate,
            is_active: this.isActive,
          }
        );
        this.$swal.fire("Success", "Pricing updated successfully!", "success");
        this.closePlanDialog();
        this.$emit("refresh-model");
      } catch (err) {
        this.$swal.fire(
          "Error",
          err.response?.data?.message || "Failed to update pricing",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
