<template>
  <v-container fluid>
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
          <v-card outlined rounded="lg" height="100%">
            <v-container>
              <h3>
                <v-icon class="mr-2">mdi-motorbike</v-icon>Vehicle Details
              </h3>

              <div class="my-4">
                <div class="d-flex justify-space-between">
                  <span>Registration</span>
                  <span class="font-weight-bold">{{
                    localvehicle.registration_number || "N/A"
                  }}</span>
                </div>

                <div class="d-flex justify-space-between my-2">
                  <span>Status</span>
                  <span class="font-weight-bold">{{
                    formatStatus(localvehicle.status) || "N/A"
                  }}</span>
                </div>

                <div class="d-flex justify-space-between my-2">
                  <span>Type</span>
                  <span class="font-weight-bold">{{
                    localvehicle?.model_data?.body_type || "-"
                  }}</span>
                </div>

                <div class="d-flex justify-space-between my-2">
                  <span>Color</span>
                  <span class="font-weight-bold">{{
                    localvehicle.color || "Not specified"
                  }}</span>
                </div>

                <div class="d-flex justify-space-between my-2">
                  <span>Created At</span>
                  <span class="font-weight-bold">{{
                    formatDate(localvehicle.created_at) || "-"
                  }}</span>
                </div>
              </div>
            </v-container>
          </v-card>
        </v-col>

        <!-- Technical Specs -->
        <v-col cols="12" md="6">
          <v-card outlined rounded="lg" height="100%">
            <v-container>
              <h3>
                <v-icon class="mr-2">mdi-tools</v-icon>Technical Information
              </h3>

              <div class="my-4">
                <div class="d-flex justify-space-between my-2">
                  <span>Chassis Number</span>
                  <span class="font-weight-bold">{{
                    localvehicle.chassis_number || "N/A"
                  }}</span>
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Engine Number</span>
                  <span class="font-weight-bold">{{
                    localvehicle.engine_number || "N/A"
                  }}</span>
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Odometer</span>
                  <span class="font-weight-bold"
                    >{{ localvehicle.current_km || "-" }} km</span
                  >
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Next Service </span>
                  <span class="font-weight-bold"
                    >{{ localvehicle.next_service_km || "-" }} km</span
                  >
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Service Date</span>
                  <span class="font-weight-bold">{{
                    localvehicle.next_service_date || "-"
                  }}</span>
                </div>
              </div>
            </v-container>
          </v-card>
        </v-col>

        <!-- Model Info -->
        <v-col cols="12" md="6" v-if="localvehicle.model_data">
          <v-card outlined rounded="lg" height="100%">
            <v-container>
              <h3><v-icon class="mr-2">mdi-cogs</v-icon>Model Specification</h3>

              <div class="my-4">
                <div class="d-flex justify-space-between my-2">
                  <span>Make</span>
                  <span class="font-weight-bold">{{
                    localvehicle.model_data.make || "N/A"
                  }}</span>
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Model</span>
                  <span class="font-weight-bold">{{
                    localvehicle.model_data.model_name || "N/A"
                  }}</span>
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Year</span>
                  <span class="font-weight-bold">{{
                    localvehicle.model_data.year || "-"
                  }}</span>
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Engine Type</span>
                  <span class="font-weight-bold">{{
                    localvehicle.model_data.engine_type || "-"
                  }}</span>
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Fuel Capacity</span>
                  <span class="font-weight-bold"
                    >{{ localvehicle.model_data.fuel_capacity || "-" }} L</span
                  >
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Seats</span>
                  <span class="font-weight-bold">{{
                    localvehicle.model_data.seat_capacity || "-"
                  }}</span>
                </div>
              </div>
            </v-container>
          </v-card>
        </v-col>

        <!-- Pricing Info -->
        <!-- <v-col cols="12" md="6" v-if="localvehicle.model_data">
          <v-card outlined rounded="lg" height="100%">
            <v-container>
              <h3><v-icon class="mr-2">mdi-cash</v-icon>Rental Pricing</h3>

              <div class="my-4">
                <div class="d-flex justify-space-between my-2">
                  <span>Hourly</span>
                  <span class="font-weight-bold"
                    >₹{{
                      localvehicle.model_data.base_hourly_rate || "-"
                    }}</span
                  >
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Daily</span>
                  <span class="font-weight-bold"
                    >₹{{ localvehicle.model_data.base_daily_rate || "-" }}</span
                  >
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Weekly</span>
                  <span class="font-weight-bold"
                    >₹{{
                      localvehicle.model_data.base_weekly_rate || "-"
                    }}</span
                  >
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Monthly</span>
                  <span class="font-weight-bold"
                    >₹{{
                      localvehicle.model_data.base_monthly_rate || "-"
                    }}</span
                  >
                </div>
              </div>
            </v-container>
          </v-card>
        </v-col> -->

        <!-- Location Info -->
        <v-col cols="12" md="6" v-if="localvehicle.location_data">
          <v-card outlined rounded="lg" height="100%">
            <v-container>
              <h3>
                <v-icon class="mr-2">mdi-map-marker</v-icon>Location Details
              </h3>

              <div class="my-4">
                <div class="d-flex justify-space-between my-2">
                  <span>Hub</span>
                  <span class="font-weight-bold">{{
                    localvehicle.location_data.name || "N/A"
                  }}</span>
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Address</span>
                  <span class="font-weight-bold">{{
                    localvehicle.location_data.address || "N/A"
                  }}</span>
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Contact</span>
                  <span class="font-weight-bold">{{
                    localvehicle.location_data.contact_number || "N/A"
                  }}</span>
                </div>
                <div class="d-flex justify-space-between my-2">
                  <span>Pincode</span>
                  <span class="font-weight-bold">{{
                    localvehicle.location_data.pincode || "N/A"
                  }}</span>
                </div>
              </div>
            </v-container>
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
