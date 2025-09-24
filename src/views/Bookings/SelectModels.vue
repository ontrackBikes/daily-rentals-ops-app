<template>
  <deep-layout>
    <v-container fluid>
      <!-- Overlay Loading -->
      <v-overlay :value="loading">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>

      <!-- Header: Models Count + Location Filter -->
      <v-row align="center" justify="space-between">
        <v-col cols="12" md="6">
          <div class="text-caption-1 font-weight-bold">
            Vehicle Models ({{ models.length }})
          </div>
        </v-col>

        <v-col cols="12" md="3" class="d-flex justify-end">
          <v-select
            v-model="selectedLocation"
            :items="locations"
            item-text="name"
            item-value="location_id"
            label="Select Location"
            dense
            hide-details="auto"
            outlined
            @change="loadModels"
          />
        </v-col>
      </v-row>

      <!-- Vehicle Models -->
      <v-row>
        <v-col
          v-for="vehicle in models"
          :key="vehicle.model_id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card class="mx-auto" rounded="lg" outlined hover>
            <v-img
              :src="vehicle.image_url"
              height="220"
              gradient="to bottom, rgba(0,0,0,.2), rgba(0,0,0,.6)"
              class="white--text"
            >
              <v-row
                class="fill-height ma-0 pa-2"
                align="start"
                justify="space-between"
              >
                <v-col cols="auto" class="pa-0">
                  <v-chip
                    :color="
                      vehicle.status.toLowerCase() === 'active'
                        ? 'green'
                        : 'grey'
                    "
                    dark
                    small
                  >
                    {{ vehicle.status }}
                  </v-chip>
                </v-col>

                <v-col cols="auto" class="pa-0">
                  <v-card-title class="black--text pa-0">
                    {{ vehicle.model_name }}
                  </v-card-title>
                </v-col>
              </v-row>
            </v-img>

            <v-container>
              <div class="mb-2">
                <v-chip color="blue" outlined small class="mr-1">
                  {{ vehicle.body_type }}
                </v-chip>
                <v-chip color="green " outlined small class="mr-1">
                  {{ vehicle.engine_type }}
                </v-chip>
                <v-chip color="orange" outlined small>
                  {{ vehicle.start_type }}
                </v-chip>
              </div>

              <!-- Pricing Section -->
              <div
                class="mb-2"
                v-if="vehicle.vehicle_model_pricing_data.length"
              >
                <div
                  v-for="plan in vehicle.vehicle_model_pricing_data"
                  :key="plan.pricing_id"
                  class="mb-1"
                >
                  <span class="font-weight-bold text-subtitle-2">
                    ₹{{ plan.offer_rate }}
                    <span
                      v-if="plan.model_pricing_plan_data.plan_type === 'daily'"
                      >/day</span
                    >
                    <span
                      v-else-if="
                        plan.model_pricing_plan_data.plan_type === 'weekly'
                      "
                      >/week</span
                    >
                    <span
                      v-else-if="
                        plan.model_pricing_plan_data.plan_type === 'monthly'
                      "
                      >/month</span
                    >
                  </span>
                  <span
                    v-if="plan.base_rate && plan.base_rate !== plan.offer_rate"
                    class="text-caption grey--text text-decoration-line-through mx-2"
                  >
                    ₹{{ plan.base_rate }}
                  </span>
                  <v-chip
                    v-if="plan.base_rate && plan.base_rate !== plan.offer_rate"
                    color="green lighten-4"
                    small
                  >
                    {{
                      Math.round(
                        ((plan.base_rate - plan.offer_rate) / plan.base_rate) *
                          100
                      )
                    }}% OFF
                  </v-chip>
                </div>
              </div>

              <!-- No Pricing -->
              <div v-else class="mb-2 text-caption grey--text align-center">
                <v-icon x-small color="grey">mdi-circle-off-outline</v-icon>
                <span class="ml-1">No plan available</span>
              </div>

              <div class="mb-2">
                <v-icon small color="grey darken-1">mdi-seat</v-icon>
                <span class="caption ml-1"
                  >{{ vehicle.seat_capacity }} Seats</span
                >
                <v-icon small color="grey darken-1" class="ml-3"
                  >mdi-fuel</v-icon
                >
                <span class="caption ml-1"
                  >{{ vehicle.fuel_capacity }}L Fuel</span
                >
              </div>

              <div class="my-2 align-center">
                <v-icon
                  :color="vehicle.available_vehicle_count > 0 ? 'green' : 'red'"
                  small
                >
                  {{
                    vehicle.available_vehicle_count > 0
                      ? "mdi-check-circle"
                      : "mdi-close-circle"
                  }}
                </v-icon>
                <span
                  :class="
                    vehicle.available_vehicle_count > 0
                      ? 'success--text'
                      : 'error--text'
                  "
                  class="caption ml-1"
                >
                  {{
                    vehicle.available_vehicle_count > 0
                      ? "Available"
                      : "Not Available"
                  }}
                </span>
              </div>

              <div class="d-flex align-center">
                <v-btn
                  text
                  small
                  color="primary"
                  @click="viewVehicleDetails(vehicle)"
                >
                  <v-icon left small>mdi-eye</v-icon> View
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  small
                  color="success"
                  :disabled="
                    vehicle.available_vehicle_count === 0 ||
                    vehicle.vehicle_model_pricing_data.length === 0
                  "
                  @click="bookNow(vehicle)"
                >
                  <v-icon left small>mdi-calendar-check</v-icon> Book
                </v-btn>
              </div>
            </v-container>
          </v-card>
        </v-col>
      </v-row>

      <!-- No Vehicles -->
      <v-row v-if="models.length === 0 && !loading">
        <v-col cols="12" class="text-center">
          <v-card class="pa-8" elevation="1">
            <v-icon size="64" color="grey lighten-1">mdi-motorbike-off</v-icon>
            <h3 class="text-h5 grey--text mt-4">No vehicles found</h3>
            <p class="grey--text">Try adjusting your search criteria</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- Snackbar -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        timeout="3000"
        bottom
      >
        {{ snackbar.message }}
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar.show = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </deep-layout>
</template>

<script>
import DeepLayout from "@/Layouts/DeepLayout.vue";
import api from "@/plugins/axios";

export default {
  name: "VehicleList",
  components: { DeepLayout },
  data() {
    return {
      models: [],
      locations: [],
      selectedLocation: null,
      snackbar: { show: false, message: "", color: "success" },
      loading: false,
    };
  },
  methods: {
    async loadLocations() {
      try {
        const { data } = await api.get("/api/locations");
        if (data.success) {
          this.locations = [
            { location_id: null, name: "All Locations" },
            ...data.data.locations,
          ];
          this.selectedLocation = null;
        }
      } catch (err) {
        console.error(err);
        this.snackbar = {
          show: true,
          message: "Failed to load locations",
          color: "error",
        };
      }
    },

    async loadModels() {
      this.loading = true;
      try {
        const { data } = await api.get("/api/vehicle-models", {
          params: {
            limit: 100,
            offset: 0,
            location_id: this.selectedLocation || undefined,
          },
        });
        this.models = data.data.models || [];
      } catch (err) {
        console.error(err);
        this.snackbar = {
          show: true,
          message: "Failed to load vehicles",
          color: "error",
        };
      } finally {
        this.loading = false;
      }
    },

    bookNow(vehicle) {
      this.$router.push({
        path: `/select-subscription/${vehicle.model_id}`,
      });
    },

    viewVehicleDetails(vehicle) {
      this.$router.push({
        path: "/vehicles/" + vehicle.model_id,
      });
    },
  },
  mounted() {
    this.loadLocations();
    this.loadModels();
  },
};
</script>
