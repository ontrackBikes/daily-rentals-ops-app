<template>
  <v-container fluid class="pa-6">
    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="48" />
      <div class="mt-4 text-body-1 grey--text">Loading vehicle data...</div>
    </div>

    <!-- Data -->
    <div v-else-if="localvehicle">
      <v-row dense>
        <!-- Vehicle Info -->
        <v-col cols="12" md="6">
          <v-card class="pa-4" elevation="2">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-motorbike</v-icon>
              <span class="text-h6">Vehicle Details</span>
            </v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12"
                  ><strong>Registration:</strong>
                  {{ localvehicle.registration_number }}</v-col
                >
                <v-col cols="12"
                  ><strong>Status:</strong>
                  {{ formatStatus(localvehicle.status) }}</v-col
                >
                <v-col cols="12"
                  ><strong>Type:</strong> {{ localvehicle.vehicle_type }}</v-col
                >
                <v-col cols="12"
                  ><strong>Color:</strong>
                  {{ localvehicle.color || "Not specified" }}</v-col
                >
                <v-col cols="12"
                  ><strong>Created At:</strong>
                  {{ formatDate(localvehicle.created_at) }}</v-col
                >
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Technical Specs -->
        <v-col cols="12" md="6">
          <v-card class="pa-4" elevation="2">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-tools</v-icon>
              <span class="text-h6">Technical Information</span>
            </v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12"
                  ><strong>Chassis Number:</strong>
                  {{ localvehicle.chassis_number }}</v-col
                >
                <v-col cols="12"
                  ><strong>Engine Number:</strong>
                  {{ localvehicle.engine_number }}</v-col
                >
                <v-col cols="12"
                  ><strong>Odometer:</strong>
                  {{ localvehicle.current_km }} km</v-col
                >
                <v-col cols="12"
                  ><strong>Next Service @:</strong>
                  {{ localvehicle.next_service_km }} km</v-col
                >
                <v-col cols="12"
                  ><strong>Service Date:</strong>
                  {{ localvehicle.next_service_date }}</v-col
                >
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Model Info -->
        <v-col cols="12" md="6" v-if="localvehicle.model_data">
          <v-card class="pa-4" elevation="2">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-car-cog</v-icon>
              <span class="text-h6">Model Specification</span>
            </v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12"
                  ><strong>Make:</strong>
                  {{ localvehicle.model_data.make }}</v-col
                >
                <v-col cols="12"
                  ><strong>Model:</strong>
                  {{ localvehicle.model_data.model_name }}</v-col
                >
                <v-col cols="12"
                  ><strong>Year:</strong>
                  {{ localvehicle.model_data.year }}</v-col
                >
                <v-col cols="12"
                  ><strong>Engine Type:</strong>
                  {{ localvehicle.model_data.engine_type }}</v-col
                >
                <v-col cols="12"
                  ><strong>Fuel Capacity:</strong>
                  {{ localvehicle.model_data.fuel_capacity }} L</v-col
                >
                <v-col cols="12"
                  ><strong>Seats:</strong>
                  {{ localvehicle.model_data.seat_capacity }}</v-col
                >
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Pricing Info -->
        <v-col cols="12" md="6" v-if="localvehicle.model_data">
          <v-card class="pa-4" elevation="2">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-cash</v-icon>
              <span class="text-h6">Rental Pricing</span>
            </v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12"
                  ><strong>Hourly:</strong> ₹{{
                    localvehicle.model_data.base_hourly_rate
                  }}</v-col
                >
                <v-col cols="12"
                  ><strong>Daily:</strong> ₹{{
                    localvehicle.model_data.base_daily_rate
                  }}</v-col
                >
                <v-col cols="12"
                  ><strong>Weekly:</strong> ₹{{
                    localvehicle.model_data.base_weekly_rate
                  }}</v-col
                >
                <v-col cols="12"
                  ><strong>Monthly:</strong> ₹{{
                    localvehicle.model_data.base_monthly_rate
                  }}</v-col
                >
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Location -->
        <v-col cols="12" md="12" v-if="localvehicle.location_data">
          <v-card class="pa-4" elevation="2">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-map-marker</v-icon>
              <span class="text-h6">Location Details</span>
            </v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12"
                  ><strong>Hub:</strong>
                  {{ localvehicle.location_data.name }}</v-col
                >
                <v-col cols="12"
                  ><strong>Address:</strong>
                  {{ localvehicle.location_data.address }}</v-col
                >
                <v-col cols="12"
                  ><strong>Contact:</strong>
                  {{ localvehicle.location_data.contact_number }}</v-col
                >
                <v-col cols="12"
                  ><strong>Pincode:</strong>
                  {{ localvehicle.location_data.pincode }}</v-col
                >
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- No Data -->
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
export default {
  name: "OverviewTab",
  props: {
    vehicle: {
      type: Object,
      required: true,
    },
  },
  computed: {
    localvehicle() {
      return this.vehicle || null;
    },
    isLoading() {
      return !this.vehicle;
    },
  },
  methods: {
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString("en-GB");
    },
    formatStatus(status) {
      return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    },
  },
};
</script>
