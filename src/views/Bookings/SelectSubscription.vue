<template>
  <deep-layout>
    <v-overlay :value="loading" absolute>
      <v-progress-circular indeterminate size="64" color="primary" />
    </v-overlay>

    <v-container>
      <div class="text-center mb-4">
        <h1 class="font-weight-light">Choose Your Rental Plan</h1>
      </div>

      <v-row>
        <!-- Left Side: Subscription Plans + Addons -->
        <v-col cols="12" md="7">
          <v-card outlined class="px-4 rounded-lg">
            <!-- Subscription Plans -->
            <v-radio-group v-model="form.plan">
              <v-row dense>
                <v-col
                  cols="12"
                  md="6"
                  v-for="pricing in model?.vehicle_model_pricing_data || []"
                  :key="pricing.pricing_id"
                >
                  <v-card
                    flat
                    color="grey lighten-4"
                    class="cursor-pointer rounded-lg"
                    @click="
                      form.plan = pricing.model_pricing_plan_data.plan_type
                    "
                  >
                    <v-card-text class="pa-4">
                      <!-- Radio + Title -->
                      <div class="d-flex align-center mb-3">
                        <v-radio
                          :value="pricing.model_pricing_plan_data.plan_type"
                          color="primary"
                          class="mr-3"
                        />
                        <div>
                          <h3 class="subtitle-1 font-weight-bold">
                            {{
                              pricing.model_pricing_plan_data.plan_name.replace(
                                "Rental Plan",
                                ""
                              )
                            }}
                          </h3>
                          <p class="caption text--secondary mb-0">
                            {{
                              pricing.model_pricing_plan_data.plan_description
                            }}
                          </p>
                        </div>
                      </div>

                      <!-- Price -->
                      <div class="d-flex align-baseline mb-3">
                        <span class="headline font-weight-bold primary--text">
                          ₹{{
                            Number(
                              pricing.offer_rate || pricing.base_rate
                            ).toFixed(2)
                          }}
                        </span>
                        <span class="body-2 ml-2 text--secondary">
                          /
                          {{
                            pricing.model_pricing_plan_data.plan_type ===
                            "weekly"
                              ? "week"
                              : "month"
                          }}
                        </span>
                      </div>

                      <!-- Terms -->
                      <v-divider class="my-3" />
                      <p
                        class="caption text--secondary"
                        v-html="pricing.model_pricing_plan_data.plan_terms"
                      ></p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-radio-group>

            <!-- Location Select -->
            <div v-if="model">
              <v-tabs v-model="activeTab" background-color="transparent" grow>
                <v-tab value="pickup">Pickup</v-tab>
                <v-tab value="delivery">Delivery</v-tab>
              </v-tabs>

              <v-tabs-items v-model="activeTab" class="mt-4 pa-2">
                <v-tab-item>
                  <v-select
                    v-model="pickupLocation"
                    :items="locations"
                    item-text="name"
                    item-value="location_id"
                    label="Pickup location"
                    :loading="locationsLoading"
                    outlined
                    dense
                    hide-details
                  ></v-select>

                  <!-- <v-btn
                    class="mt-4"
                    color="primary"
                    :loading="checking"
                    block
                    @click="checkServiceability('pickup')"
                    :disabled="!pickupLocation"
                  >
                    Check Serviceability
                  </v-btn> -->
                </v-tab-item>

                <v-tab-item>
                  <div class="d-flex">
                    <v-select
                      v-model="pickupLocation"
                      :items="locations"
                      item-text="name"
                      item-value="location_id"
                      label="Select provider location"
                      :loading="locationsLoading"
                      outlined
                      dense
                      hide-details
                    ></v-select>
                    <v-text-field
                      v-model="deliveryPincode"
                      label="Check for Delivery"
                      outlined
                      dense
                      class="ml-3 flex-grow-1"
                      hide-details
                      type="number"
                    ></v-text-field>
                  </div>

                  <v-btn
                    class="mt-4"
                    color="primary"
                    :loading="checking"
                    block
                    @click="checkServiceability('delivery')"
                    :disabled="!deliveryPincode || !pickupLocation"
                  >
                    Check Serviceability
                  </v-btn>
                </v-tab-item>
              </v-tabs-items>

              <!-- ================= Result ================= -->
              <v-alert
                v-if="serviceabilityMsg"
                :type="isServiceable ? 'success' : 'error'"
                dense
                outlined
                class="mt-4 text-center"
              >
                {{ serviceabilityMsg }}
              </v-alert>

              <!-- Addons -->
              <h4 class="font-weight-medium my-2 d-flex align-center">
                <v-icon small class="mr-2">mdi-plus-circle</v-icon>
                Enhance Your Experience
              </h4>

              <v-row dense>
                <v-col
                  cols="12"
                  v-for="addon in addons"
                  :key="addon.value"
                  class="mb-2"
                >
                  <v-card
                    outlined
                    class="cursor-pointer rounded-lg"
                    :color="form.addons.includes(addon.value) ? 'primary' : ''"
                    :dark="form.addons.includes(addon.value)"
                    @click="toggleAddon(addon.value)"
                  >
                    <v-card-text class="pa-3 d-flex align-center">
                      <v-icon
                        size="20"
                        class="mr-3"
                        :color="
                          form.addons.includes(addon.value) ? 'white' : 'grey'
                        "
                      >
                        {{ addon.icon }}
                      </v-icon>
                      <div class="text-left flex-grow-1">
                        <div class="font-weight-medium">{{ addon.label }}</div>
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
            </div>

            <!-- Error State -->
            <div v-if="!model && !loading" class="text-center py-12">
              <v-icon size="64" color="error">mdi-alert-circle</v-icon>
              <h3 class="headline mt-4 mb-2">
                Failed to load vehicle information
              </h3>
              <p class="text--secondary mb-4">
                Please try again or contact support
              </p>
              <v-btn
                rounded
                color="primary"
                @click="loadModel(model_id)"
                depressed
              >
                Retry
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <!-- Right Side: Model Details -->
        <v-col cols="12" md="5">
          <v-card outlined class="pa-4 rounded-lg">
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

            <!-- Model Info -->
            <div class="overline text--secondary mb-1">
              {{ model?.make?.toUpperCase() }}
            </div>
            <h2 class="subtitle-1 font-weight-bold mb-2">
              {{ model?.model_name }}
            </h2>

            <!-- Chips -->
            <div class="mb-3">
              <v-chip small class="mr-2 mb-1" color="success" outlined>
                <v-icon small left>mdi-leaf</v-icon>
                {{ model?.vehicle_type }}
              </v-chip>
              <v-chip small class="mr-2 mb-1" outlined>
                <v-icon small left>mdi-account-multiple</v-icon>
                {{ model?.seat_capacity }} Seats
              </v-chip>
              <v-chip small class="mb-1" outlined>
                <v-icon small left>mdi-speedometer</v-icon>
                {{ model?.range_km }} km Range
              </v-chip>
            </div>

            <!-- Description -->
            <p class="body-2 text--secondary">
              {{ model?.description?.substring(0, 120) }}...
            </p>

            <!-- Pricing Summary -->
            <v-divider class="my-3" />
            <div class="d-flex justify-space-between align-center">
              <span class="subtitle-2 text--secondary">Selected Plan</span>
              <span class="subtitle-1 font-weight-bold primary--text">
                ₹{{ subscriptionPrice }}
              </span>
            </div>
          </v-card>

          <v-select
            v-model="form.vehicle"
            :items="availableVehicles"
            item-text="registration_number"
            item-value="vehicle_id"
            label="Select Vehicle"
            outlined
            dense
            class="mt-4"
            :disabled="!pickupLocation || availableVehicles.length === 0"
            placeholder="Choose a vehicle"
          />

          <!-- Continue Button -->
          <v-btn
            large
            block
            rounded
            depressed
            color="primary"
            class="text-capitalize my-4"
            :disabled="
              !pickupLocation || (activeTab === 1 && isServiceable === false)
            "
            @click="goToCustomerDetails()"
          >
            Continue ₹{{ grandTotal }}
            <v-icon right>mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </deep-layout>
</template>

<script>
import api from "@/plugins/axios";
import DeepLayout from "@/Layouts/DeepLayout.vue";

export default {
  name: "SubscriptionPlan",
  components: { DeepLayout },
  data() {
    return {
      model_id: this.$route.params.model_id,
      form: {
        plan: "monthly",
        pickupLocation: null,
        addons: [],
        vehicle: null,
        service_type: null,
      },
      model: null,
      locations: [],
      addons: [],
      loading: false,
      locationsLoading: false,
      activeTab: 0,
      pickupLocation: null,
      deliveryPincode: "",

      checking: false,
      serviceabilityMsg: "",
      isServiceable: false,
    };
  },
  async mounted() {
    await this.loadModel(this.model_id);
    if (this.model) {
      await this.fetchLocations(this.model_id);
    }
    this.fetchAddons();
  },
  computed: {
    availableVehicles() {
      if (!this.model || !this.pickupLocation) return [];
      return this.model.vehicle_data.filter(
        (v) => v.location_id === this.pickupLocation && v.status === "available"
      );
    },
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

    goToCustomerDetails() {
      const selectedPlan = this.model.vehicle_model_pricing_data.find(
        (p) => p.model_pricing_plan_data.plan_type === this.form.plan
      );

      const pricingId = selectedPlan ? selectedPlan.pricing_id : null;
      this.$router.push({
        path: "/customer-details",
        query: {
          modelId: this.model_id,
          total: this.grandTotal,
          subscription: this.form.plan,
          pricingId: pricingId,
          addons: JSON.stringify(this.form.addons),
          vehicleId: this.form.vehicle,
          type: this.activeTab === 0 ? "pickup" : "delivery",
          locationId: this.pickupLocation,
          pincode: this.deliveryPincode,
        },
      });
    },
    async checkServiceability(type) {
      try {
        this.checking = true;
        this.serviceabilityMsg = "";

        const payload = {
          model_id: this.model_id,
          location_id: this.pickupLocation || 1,
          pincode: type === "pickup" ? "560001" : this.deliveryPincode,
          service_type: type,
        };

        const res = await api.post(`api/serviceable-pincode/check`, payload);

        const data = res.data?.data;
        this.isServiceable = data?.is_serviceable;
        this.serviceabilityMsg = res.data?.message || "Check completed";
      } catch (err) {
        console.error("Error checking serviceability:", err);
        this.serviceabilityMsg = "Something went wrong. Please try again.";
        this.isServiceable = false;
      } finally {
        this.checking = false;
      }
    },

    async fetchAddons() {
      try {
        this.loading = true;
        const res = await api.get(`/api/addons`);
        const rawAddons = res.data?.data?.addons || [];

        this.addons = rawAddons.map((a) => ({
          label: a.addon_name,
          value: a.provider_addon_id,
          price:
            a.addon_type === "per_day"
              ? Number(a.offer_price_per_day || a.base_price_per_day)
              : Number(a.offer_price_per_booking || a.base_price_per_booking),
          icon:
            a.description === "Protective helmet"
              ? "mdi-racing-helmet"
              : "mdi-cellphone-dock",
          description: a.description,
        }));
      } catch (err) {
        console.error("Error fetching addons:", err);
        this.addons = [];
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
