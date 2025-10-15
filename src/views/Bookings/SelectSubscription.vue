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

            <!-- Addons -->
            <div v-if="model && addons.length">
              <h4 class="font-weight-medium my-2 d-flex align-center">
                <v-icon small class="mr-2">mdi-plus-circle</v-icon>
                Enhance Your Experience
              </h4>

              <v-card outlined rounded="xl" class="pa-4">
                <div
                  v-for="addon in addons"
                  :key="addon.addon_id"
                  class="d-flex justify-space-between align-center py-3 addon-item"
                >
                  <!-- Left Side -->
                  <div class="d-flex align-center">
                    <v-avatar size="45" class="mr-3" color="grey lighten-4">
                      <v-icon size="26">{{ getAddonIcon(addon.name) }}</v-icon>
                    </v-avatar>

                    <div>
                      <div class="font-weight-medium">
                        {{ addon.name }}
                        <span class="text-primary text-caption">
                          (₹{{ addon.price }} /
                          {{
                            addon.type === "per_booking" ? "booking" : "day"
                          }})
                        </span>
                      </div>
                      <div class="text-primary text-caption">
                        {{ addon.description }}
                      </div>
                    </div>
                  </div>

                  <!-- Right Side -->
                  <div class="d-flex align-center">
                    <v-chip
                      v-if="addon.quantity_left < 5"
                      outlined
                      small
                      :color="addon.quantity_left > 2 ? 'warning' : 'error'"
                      class="mr-4"
                    >
                      {{ addon.quantity_left }} left
                    </v-chip>

                    <div
                      class="d-flex align-center grey lighten-4 px-2 py-1 rounded-pill"
                    >
                      <v-btn
                        icon
                        small
                        :disabled="getAddonQty(addon.provider_addon_id) === 0"
                        @click="decreaseAddonQty(addon.provider_addon_id)"
                      >
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>

                      <span class="mx-3 text-body-2 font-weight-medium">
                        {{ getAddonQty(addon.provider_addon_id) }}
                      </span>

                      <v-btn
                        icon
                        small
                        color="primary"
                        :disabled="
                          getAddonQty(addon.provider_addon_id) >=
                          addon.quantity_left
                        "
                        @click="increaseAddonQty(addon)"
                      >
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-card>
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

            <div class="overline text--secondary mb-1">
              {{ model?.make?.toUpperCase() }}
            </div>
            <h2 class="subtitle-1 font-weight-bold mb-2">
              {{ model?.model_name }}
            </h2>

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

            <p class="body-2 text--secondary">
              {{ model?.description?.substring(0, 120) }}...
            </p>

            <v-divider class="my-3" />
            <div class="d-flex justify-space-between align-center">
              <span class="subtitle-2 text--secondary">Selected Plan</span>
              <span class="subtitle-1 font-weight-bold primary--text">
                ₹{{ subscriptionPrice }}
              </span>
            </div>
          </v-card>

          <v-btn
            large
            block
            rounded
            depressed
            color="primary"
            class="text-capitalize my-4"
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
      loading: false,
      form: {
        plan: "monthly",
        addons: [],
      },
      model: null,
      addons: [],
    };
  },
  async mounted() {
    await this.loadModel(this.model_id);
    await this.fetchAddons();
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
      return this.form.addons.reduce((sum, a) => {
        const addon = this.addons.find(
          (x) => x.provider_addon_id === a.provider_addon_id
        );
        return addon ? sum + addon.price * a.qty : sum;
      }, 0);
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
    goToCustomerDetails() {
      const selectedPlan = this.model.vehicle_model_pricing_data.find(
        (p) => p.model_pricing_plan_data.plan_type === this.form.plan
      );
      this.$router.push({
        path: "/customer-details",
        query: {
          modelId: this.model_id,
          total: this.grandTotal,
          subscription: this.form.plan,
          pricingId: selectedPlan?.pricing_id || null,
          addons: JSON.stringify(this.form.addons),
        },
      });
    },
    getAddonIcon(name) {
      const lower = name.toLowerCase();
      if (lower.includes("helmet")) return "mdi-racing-helmet";
      if (lower.includes("phone")) return "mdi-cellphone-dock";
      if (lower.includes("lock")) return "mdi-lock";
      if (lower.includes("rain")) return "mdi-umbrella";
      return "mdi-plus-circle";
    },
    getAddonQty(addonId) {
      const item = this.form.addons.find(
        (a) => a.provider_addon_id === addonId
      );
      return item ? item.qty : 0;
    },
    increaseAddonQty(addon) {
      const existing = this.form.addons.find(
        (a) => a.provider_addon_id === addon.provider_addon_id
      );
      if (existing) {
        if (existing.qty < addon.quantity_left) existing.qty++;
      } else {
        this.form.addons.push({
          provider_addon_id: addon.provider_addon_id,
          addon_name: addon.name, // ✅ include addon name here
          qty: 1,
        });
      }
    },

    decreaseAddonQty(addonId) {
      const index = this.form.addons.findIndex(
        (a) => a.provider_addon_id === addonId
      );
      if (index > -1) {
        const item = this.form.addons[index];
        if (item.qty > 1) item.qty--;
        else this.form.addons.splice(index, 1);
      }
    },

    async fetchAddons() {
      this.loading = true;
      try {
        const { data } = await api.get("/api/addons");
        const rawAddons = data?.data?.addons ?? [];

        this.addons = rawAddons
          .filter((addon) => addon.available !== false)
          .map((addon) => ({
            provider_addon_id: addon.provider_addon_id,
            name: addon.addon_name,
            type: addon.addon_type,
            description: addon.description,
            price: Number(
              addon.addon_type === "per_day"
                ? addon.offer_price_per_day || addon.base_price_per_day
                : addon.offer_price_per_booking || addon.base_price_per_booking
            ),
            quantity_left: addon.quantity_left ?? 5, // fallback if not returned
          }));
      } catch (error) {
        console.error("❌ Failed to fetch addons:", error);
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
