<template>
  <deep-layout>
    <v-container fluid>
      <!-- Loading State -->
      <v-row v-if="loading" justify="center" class="my-12">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64" />
          <div class="mt-4 text-h6 grey--text">Loading location details...</div>
        </v-col>
      </v-row>

      <!-- Main Content -->
      <v-row v-else-if="location" dense>
        <!-- LEFT PANEL -->
        <v-col cols="12" md="3">
          <v-card outlined class="pa-4 rounded-lg">
            <!-- Status -->
            <div class="d-flex align-center justify-space-between mb-3">
              <v-chip
                small
                :color="location.is_active ? 'success' : 'grey'"
                dark
              >
                {{ location.is_active ? "Active" : "Inactive" }}
              </v-chip>
            </div>

            <!-- Name -->
            <div class="text-h6 font-weight-bold">
              {{ location.name }}
            </div>
            <div class="grey--text text--darken-1">
              {{ location.city_data?.city_name }}
            </div>

            <!-- Attributes -->
            <div class="mt-3">
              <div class="d-flex align-center mb-2">
                <v-icon small color="indigo" class="mr-2"
                  >mdi-map-marker</v-icon
                >
                <span class="text-body-2">{{
                  location.address || "No address"
                }}</span>
              </div>

              <div class="d-flex align-center mb-2">
                <v-icon small color="indigo" class="mr-2">mdi-phone</v-icon>
                <span class="text-body-2">{{
                  location.contact_number || "N/A"
                }}</span>
              </div>

              <div class="d-flex align-center mb-2">
                <v-icon small color="indigo" class="mr-2">mdi-calendar</v-icon>
                <span class="text-body-2">
                  Created: {{ formatDate(location.created_at) }}
                </span>
              </div>
            </div>

            <!-- Timing & Service Days -->
            <div class="mt-4 text-body-2">
              <div>
                <strong>Service Days:</strong>
                {{ location.service_days || "N/A" }}
              </div>
              <div>
                <strong>Pickup:</strong> {{ location.pickup_start_time }} -
                {{ location.pickup_end_time }}
              </div>
              <div>
                <strong>Drop:</strong> {{ location.drop_start_time }} -
                {{ location.drop_end_time }}
              </div>
              <div>
                <strong>Service:</strong> {{ location.service_start_time }} -
                {{ location.service_end_time }}
              </div>
            </div>

            <!-- Image / Icon -->
            <div class="text-center mt-5">
              <v-img
                v-if="location.image_url"
                :src="location.image_url"
                max-height="160"
                max-width="220"
                contain
                class="mx-auto rounded"
              />
              <v-icon v-else size="80" color="grey lighten-2"
                >mdi-map-marker</v-icon
              >
            </div>

            <!-- Edit Button -->
            <!-- <div class="text-center mt-4">
              <v-btn rounded color="primary" @click="editDialog = true">
                Edit Location
              </v-btn>
            </div> -->
          </v-card>
        </v-col>

        <!-- RIGHT PANEL -->
        <v-col cols="12" md="9">
          <v-card flat>
            <!-- Tabs -->
            <v-tabs
              v-model="activeTab"
              background-color="transparent"
              show-arrows
              slider-color="primary"
            >
              <v-tab>Overview</v-tab>
              <v-tab>Serviceable Pincodes</v-tab>
            </v-tabs>

            <!-- Tabs Content -->
            <v-tabs-items v-model="activeTab">
              <!-- Overview Tab -->
              <v-tab-item>
                <v-card flat class="pa-6 elevation-1">
                  <section>
                    <h3 class="font-weight-bold mb-3">Location Details</h3>
                    <v-row dense>
                      <v-col cols="12" sm="6">
                        <strong>Name:</strong> {{ location.name }}
                      </v-col>
                      <v-col cols="12" sm="6">
                        <strong>City:</strong>
                        {{ location.city_data?.city_name }}
                      </v-col>
                      <v-col cols="12" sm="6">
                        <strong>Address:</strong> {{ location.address }}
                      </v-col>
                      <v-col cols="12" sm="6">
                        <strong>Contact:</strong> {{ location.contact_number }}
                      </v-col>
                      <v-col cols="12" sm="6">
                        <strong>Service Days:</strong>
                        {{ location.service_days }}
                      </v-col>
                      <v-col cols="12" sm="6">
                        <strong>Created:</strong>
                        {{ formatDate(location.created_at) }}
                      </v-col>
                    </v-row>
                  </section>
                </v-card>
              </v-tab-item>

              <!-- Serviceable Pincodes Tab -->
              <v-tab-item>
                <serviceable-pincode :location_id="locationId" />
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </v-col>
      </v-row>

      <!-- Empty State -->
      <v-row v-else justify="center" class="my-12">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="120" color="grey lighten-2">mdi-map-marker</v-icon>
          <div class="text-h5 mt-4 grey--text">No location data available</div>
        </v-col>
      </v-row>
    </v-container>
  </deep-layout>
</template>

<script>
import DeepLayout from "@/Layouts/DeepLayout.vue";
import ServiceablePincode from "./Tabs/ServiceablePincode.vue";
import api from "@/plugins/axios";
import Swal from "sweetalert2";

export default {
  name: "LocationView",
  components: { DeepLayout, ServiceablePincode },
  data() {
    return {
      locationId: this.$route.params.location_id,
      location: null,
      loading: false,

      activeTab: 0,
      editDialog: false,
    };
  },
  mounted() {
    this.fetchLocation();
  },
  methods: {
    async fetchLocation() {
      this.loading = true;
      try {
        const { data } = await api.get(`/api/location/${this.locationId}`);
        this.location = data.data;
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load location details", "error");
      } finally {
        this.loading = false;
      }
    },
    async fetchPincodes() {
      this.pincodeLoading = true;
      try {
        const { data } = await api.get(
          `/api/location/${this.locationId}/serviceable-pincodes`,
          { params: { limit: 10, offset: 0 } }
        );
        // Filter based on service type
        const all = data.data?.serviceablePincodes || [];
        this.pincodes = all.filter((p) =>
          this.serviceType === "pickup"
            ? p.is_pickup_serviceable
            : p.is_delivery_serviceable
        );
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load pincodes", "error");
      } finally {
        this.pincodeLoading = false;
      }
    },

    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString("en-GB");
    },
  },
};
</script>
