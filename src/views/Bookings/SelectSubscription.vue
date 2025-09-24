<template>
  <v-app dark>
    <v-main>
      <v-container class="pa-6">
        <div class="text-center mb-8">
          <h1 class="display-1 font-weight-light mb-4">
            Choose Your Rental Plan
          </h1>
        </div>

        <div v-if="loading" class="text-center py-12">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="mt-4 text--secondary">Loading vehicle information...</p>
        </div>

        <div v-else-if="model">
          <v-row justify="center" class="mb-6">
            <v-col cols="12" md="10" lg="8">
              <v-card elevation="2">
                <v-row no-gutters>
                  <v-col cols="12" md="3">
                    <v-img :src="model.image_url" height="150" cover>
                      <template v-slot:placeholder>
                        <v-row
                          class="fill-height ma-0"
                          align="center"
                          justify="center"
                        >
                          <v-progress-circular
                            indeterminate
                            color="primary"
                          ></v-progress-circular>
                        </v-row>
                      </template>
                    </v-img>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card-text class="pa-2">
                      <div class="overline text--secondary">
                        {{ model.make?.toUpperCase() }}
                      </div>
                      <h3 class="font-weight-medium">
                        {{ model.model_name }}
                      </h3>
                      <div>
                        <v-chip
                          small
                          class="mr-2 mb-1"
                          color="success"
                          outlined
                        >
                          <v-icon small left>mdi-leaf</v-icon>
                          {{ model.vehicle_type }}
                        </v-chip>
                        <v-chip small class="mr-2 mb-2" outlined>
                          <v-icon small left>mdi-account-multiple</v-icon>
                          {{ model.seat_capacity }} Seats
                        </v-chip>
                        <v-chip small class="mb-2" outlined>
                          <v-icon small left>mdi-speedometer</v-icon>
                          {{ model.range_km }}km Range
                        </v-chip>
                      </div>
                      <p class="text--secondary">
                        {{ model.description?.substring(0, 150) }}...
                      </p>
                    </v-card-text>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

          <v-radio-group v-model="form.plan" row>
            <v-row class="mb-8" justify="center">
              <v-col
                cols="12"
                md="4"
                v-for="pricing in model.vehicle_model_pricing_data"
                :key="pricing.pricing_id"
              >
                <v-card
                  @click="form.plan = pricing.model_pricing_plan_data.plan_type"
                  class="cursor-pointer"
                  elevation="2"
                  height="100%"
                >
                  <v-card-text class="pa-6">
                    <div class="d-flex align-center mb-4">
                      <v-radio
                        :value="pricing.model_pricing_plan_data.plan_type"
                        color="primary"
                        class="mr-3"
                      ></v-radio>
                      <div>
                        <h3 class="title font-weight-medium">
                          {{
                            pricing.model_pricing_plan_data.plan_name.replace(
                              "Rental Plan",
                              ""
                            )
                          }}
                        </h3>
                        <p class="caption mb-0">
                          {{ pricing.model_pricing_plan_data.plan_description }}
                        </p>
                      </div>
                    </div>
                    <div class="d-flex align-baseline mb-4">
                      <span class="display-1 font-weight-light">
                        ₹{{
                          Number(
                            pricing.offer_rate || pricing.base_rate
                          ).toFixed(2)
                        }}
                      </span>
                      <span class="body-2 ml-2">
                        /
                        {{
                          pricing.model_pricing_plan_data.plan_type === "weekly"
                            ? "week"
                            : "month"
                        }}
                      </span>
                    </div>
                    <v-divider class="mb-4"></v-divider>
                    <div>
                      <p
                        class="body-2"
                        v-html="pricing.model_pricing_plan_data.plan_terms"
                      ></p>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-radio-group>

          <v-row justify="center">
            <v-col cols="12" md="12">
              <v-card elevation="2">
                <v-card-text class="pa-4">
                  <h3 class="font-weight-medium mb-2">
                    <v-icon class="mr-2">mdi-map-marker</v-icon>
                    Select Pickup Location
                  </h3>
                  <v-select
                    v-model="form.location"
                    :items="locations"
                    item-text="name"
                    item-value="location_id"
                    label="Choose your preferred location"
                    outlined
                    :loading="locationsLoading"
                    :disabled="locationsLoading"
                  >
                    <template v-slot:item="{ item }">
                      <div class="pa-2">
                        <div class="font-weight-medium">
                          {{ item.name }}
                        </div>
                        <div class="caption text--secondary">
                          {{ item.address }} •
                          {{ item.available_vehicle_count }} vehicles available
                        </div>
                      </div>
                    </template>
                    <template v-slot:selection="{ item }">
                      <div>
                        <span class="font-weight-medium">{{ item.name }}</span>
                        <span class="text--secondary ml-2"
                          >• {{ item.available_vehicle_count }} available</span
                        >
                      </div>
                    </template>
                  </v-select>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row justify="center" class="mb-8">
            <v-col cols="12" md="12">
              <v-card elevation="2">
                <v-card-text class="pa-4">
                  <h3 class="font-weight-medium mb-3 d-flex align-center">
                    <v-icon small class="mr-2">mdi-plus-circle</v-icon>
                    Enhance Your Experience
                  </h3>

                  <v-row dense>
                    <v-col
                      cols="12"
                      v-for="addon in addons"
                      :key="addon.value"
                      class="mb-2"
                    >
                      <v-card
                        :color="
                          form.addons.includes(addon.value) ? 'primary' : ''
                        "
                        :dark="form.addons.includes(addon.value)"
                        @click="toggleAddon(addon.value)"
                        outlined
                        class="cursor-pointer"
                        height="auto"
                        max-width="100%"
                      >
                        <v-card-text class="pa-3 d-flex align-center">
                          <v-icon
                            size="20"
                            class="mr-3"
                            :color="
                              form.addons.includes(addon.value)
                                ? 'white'
                                : 'grey'
                            "
                          >
                            {{ addon.icon }}
                          </v-icon>
                          <div class="text-left flex-grow-1">
                            <div class="font-weight-medium">
                              {{ addon.label }}
                            </div>
                            <div
                              class="caption"
                              :class="
                                form.addons.includes(addon.value)
                                  ? 'white--text'
                                  : 'text--secondary'
                              "
                            >
                              {{ addon.description }}
                            </div>
                          </div>
                          <div
                            class="font-weight-medium ml-3"
                            :class="
                              form.addons.includes(addon.value)
                                ? 'white--text'
                                : 'primary--text'
                            "
                          >
                            +₹{{ addon.price }}
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row justify="center">
            <v-col cols="12" md="10" lg="8">
              <div class="d-flex justify-space-between align-center">
                <v-btn text large @click="goBack" class="text-capitalize">
                  <v-icon left>mdi-arrow-left</v-icon>
                  Back to Models
                </v-btn>
                <v-btn
                  large
                  color="primary"
                  :disabled="!form.location"
                  @click="goToPayment"
                  class="text-capitalize px-8"
                  elevation="2"
                >
                  Continue ₹{{ grandTotal }}
                  <v-icon right>mdi-arrow-right</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </div>

        <div v-else class="text-center py-12">
          <v-icon size="64" color="error">mdi-alert-circle</v-icon>
          <h3 class="headline mt-4 mb-2">Failed to load vehicle information</h3>
          <p class="text--secondary mb-4">
            Please try again or contact support
          </p>
          <v-btn color="primary" @click="loadModel(model_id)">Retry</v-btn>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "SubscriptionPlan",
  data() {
    return {
      model_id: this.$route.params.model_id,
      form: {
        plan: "monthly",
        location: null,
        addons: [],
      },
      model: null, // Changed to null initially, will be loaded from API
      locations: [], // Changed to empty array initially, will be loaded from API
      addons: [
        {
          label: "Premium Helmet",
          value: "helmet",
          price: 100,
          icon: "mdi-shield-check",
          description: "ISI certified safety helmet",
        },

        {
          label: "Comprehensive Insurance",
          value: "insurance",
          price: 200,
          icon: "mdi-shield-account",
          description: "Full coverage protection",
        },
      ],
      loading: false,
      locationsLoading: false, // Added separate loading state for locations
    };
  },
  async mounted() {
    await this.loadModel(this.model_id);
    if (this.model) {
      await this.fetchLocations(this.model_id);
    }
  },
  computed: {
    subscriptionPrice() {
      if (!this.model || !this.form.plan) return 0;
      const plan = this.model.vehicle_model_pricing_data.find(
        (p) => p.model_pricing_plan_data.plan_type === this.form.plan
      );
      return plan ? Number(plan.offer_rate || plan.base_rate) : 0;
    },
    addonsTotal() {
      return this.addons
        .filter((a) => this.form.addons.includes(a.value))
        .reduce((sum, a) => sum + Number(a.price), 0);
    },
    grandTotal() {
      return this.subscriptionPrice + this.addonsTotal;
    },
  },

  methods: {
    async loadModel(modelId) {
      this.loading = true;
      try {
        const { data } = await api.get(`/api/vehicle-model/${modelId}`);
        this.model = data.data;
      } catch (err) {
        console.error("Error loading model:", err);
        this.model = null;
      } finally {
        this.loading = false;
      }
    },
    async fetchLocations(modelId) {
      try {
        this.locationsLoading = true;
        const res = await api.get(`/api/vehicle-model/${modelId}/locations`);
        this.locations = res.data?.data?.locations || [];
      } catch (err) {
        console.error("Error fetching locations:", err);
        this.locations = [];
      } finally {
        this.locationsLoading = false;
      }
    },
    toggleAddon(addonValue) {
      const index = this.form.addons.indexOf(addonValue);
      if (index > -1) {
        this.form.addons.splice(index, 1);
      } else {
        this.form.addons.push(addonValue);
      }
    },
    goBack() {
      console.log("Going back to models");
    },
    goToPayment() {
      console.log("Proceeding to payment with:", this.form);
    },
  },
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}
</style>
