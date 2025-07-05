<template>
  <v-container fluid class="pa-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      ></v-progress-circular>
      <div class="mt-4 text-body-1 grey--text">Loading vehicle data...</div>
    </div>

    <!-- Vehicle Details -->
    <div v-else-if="localvehicle">
      <v-row>
        <!-- Vehicle Info Card -->
        <v-col cols="12" md="12">
          <v-card class="pa-4" elevation="2">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-motorbike</v-icon>
              <span class="text-h6">Vehicle Information</span>
            </v-card-title>

            <v-card-text>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <strong>Model:</strong>
                  {{ localvehicle.model_data.model_name }}
                </v-col>
                <v-col cols="12" sm="6">
                  <strong>Type:</strong> {{ localvehicle.vehicle_type }}
                </v-col>
                <v-col cols="12" sm="6">
                  <strong>Color:</strong>
                  {{ localvehicle.color || "Not specified" }}
                </v-col>
                <v-col cols="12" sm="6">
                  <strong>Odometer:</strong>
                  {{ localvehicle.current_km || "0" }} km
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Location Info Card -->
        <v-col cols="12" md="12" v-if="localvehicle.location_data">
          <v-card class="pa-4" elevation="2">
            <v-card-title class="bg-success d-flex align-center">
              <v-icon class="mr-2">mdi-map-marker</v-icon>
              <span class="text-h6">Pickup Location</span>
            </v-card-title>

            <v-card-text>
              <v-row dense>
                <v-col cols="12">
                  <strong>Location Name:</strong>
                  {{ localvehicle.location_data.name }}
                </v-col>
                <v-col cols="12">
                  <strong>Address:</strong>
                  {{ localvehicle.location_data.address }}
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- No Data State -->
    <v-row v-else justify="center" class="py-12">
      <v-col cols="12" class="text-center">
        <v-icon size="80" color="grey lighten-2"
          >mdi-information-outline</v-icon
        >
        <div class="text-h6 mt-4 grey--text">No vehicle data available</div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import HTTP from "@/plugins/axios";

export default {
  name: "OverviewTab",
  props: {
    vehicle: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      vehicle_id: this.$route.params.vehicle_id,
      localvehicle: null,
      isLoading: false,
    };
  },
  watch: {
    vehicle: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.localvehicle = newVal;
        } else {
          this.loadVehicle();
        }
      },
    },
    "$route.params.vehicle_id": {
      handler(newId) {
        this.vehicle_id = newId;
        if (!this.vehicle) {
          this.loadVehicle();
        }
      },
    },
  },
  created() {
    this.loadVehicle();
  },
  mounted() {
    if (this.vehicle) {
      this.localvehicle = this.vehicle;
    } else {
      this.loadVehicle();
    }
  },
  methods: {
    async loadVehicle() {
      try {
        this.isLoading = true;
        const { data } = await HTTP.get(`/vehicle/${this.vehicle_id}`);
        this.localvehicle = data.data;
      } catch (error) {
        console.error("Error loading vehicle:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
