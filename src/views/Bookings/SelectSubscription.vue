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
              <h4 class="font-weight-medium my-2 d-flex align-center">
                <v-icon small class="mr-2">mdi-map-marker</v-icon>
                Select Pickup Location
              </h4>

              <v-select
                v-model="form.location"
                :items="locations"
                item-text="name"
                item-value="location_id"
                placeholder="Choose your preferred location"
                outlined
                :loading="locationsLoading"
                :disabled="locationsLoading"
              >
                <template v-slot:item="{ item }">
                  <div class="pa-2">
                    <div class="font-weight-medium">{{ item.name }}</div>
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
              <v-btn color="primary" @click="loadModel(model_id)" depressed>
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

          <!-- Continue Button -->
          <v-btn
            large
            block
            color="primary"
            class="rounded-xl text-capitalize my-4"
            elevation="2"
            :disabled="!form.location"
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
    goToCustomerDetails() {
      this.$router.push({
        path: "/customer-details",
        query: {
          modelId: this.model_id,
          total: this.grandTotal,
          subscription: this.form.plan,
          addons: JSON.stringify(this.form.addons),
        },
      });
    },
  },
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
