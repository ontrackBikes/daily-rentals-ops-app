<template>
  <v-app>
    <v-container fluid>
      <!-- Loading -->
      <v-row v-if="loading" justify="center" class="my-12">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64" />
          <div class="mt-4 text-h6 grey--text">Loading vehicle details...</div>
        </v-col>
      </v-row>

      <!-- Vehicle Info -->
      <v-row v-else-if="vehicle" dense>
        <!-- LEFT: Vehicle Summary -->
        <v-col cols="12" md="3">
          <v-card outlined class="pa-4 rounded-lg">
            <!-- Status -->
            <div class="d-flex align-center">
              <v-chip
                small
                :color="statusColor"
                text-color="white"
                class="font-weight-medium"
              >
                {{ formatStatus(vehicle.status) }}
              </v-chip>
            </div>

            <!-- Registration Number -->
            <div class="text-subtitle-1 font-weight-bold mt-2">
              {{ vehicle.registration_number }}
              <v-btn icon small @click="editVehicleDialog = true">
                <v-icon small color="primary">mdi-pencil</v-icon>
              </v-btn>
            </div>

            <!-- Created Date -->
            <div
              class="grey--text text--darken-1 text-body-2 mt-1 d-flex align-center"
            >
              <v-icon small color="indigo" class="mr-1">mdi-calendar</v-icon>
              Created: {{ formatDate(vehicle.created_at) }}
            </div>

            <!-- Vehicle Type -->
            <div
              class="grey--text text--darken-1 text-body-2 mt-1 d-flex align-center"
            >
              <v-icon small color="indigo" class="mr-1">mdi-motorbike</v-icon>
              {{ vehicle.vehicle_type }}
            </div>
            <v-divider class="my-2" />
            <!-- Image or Icon -->
            <div class="text-center mt-4">
              <v-img
                v-if="vehicle.image_url"
                :src="vehicle.image_url"
                max-height="120"
                max-width="200"
                contain
                class="mx-auto rounded"
              />
              <v-icon v-else size="80" color="grey lighten-2"
                >mdi-motorcycle</v-icon
              >
            </div>
          </v-card>
        </v-col>

        <!-- RIGHT: Tab Section -->
        <v-col cols="12" md="9">
          <!-- Tabs -->
          <v-card flat>
            <v-tabs
              v-model="activeTab"
              background-color="transparent"
              color="primary"
            >
              <v-tab> Overview</v-tab>
              <v-tab> Trace</v-tab>
              <v-tab> Bookings</v-tab>
              <v-tab> Settings</v-tab>
            </v-tabs>

            <v-tabs-items v-model="activeTab">
              <v-tab-item><OverviewTab :vehicle="vehicle" /></v-tab-item>
              <!-- Future Tabs -->
              <v-tab-item><TraceTab :vehicle="vehicle" /></v-tab-item>
              <v-tab-item><BookingsTab :vehicle-id="vehicle_id" /></v-tab-item>
              <v-tab-item
                ><SettingsTab :vehicle="vehicle" @status-updated="loadVehicle"
              /></v-tab-item>
            </v-tabs-items>
          </v-card>
        </v-col>
      </v-row>

      <!-- No Vehicle Data -->
      <v-row v-else justify="center" class="my-12">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="120" color="grey lighten-2">mdi-motorcycle</v-icon>
          <div class="text-h5 mt-4 grey--text">No vehicle data available</div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Edit Vehicle Dialog -->
    <v-dialog v-model="editVehicleDialog" max-width="700px">
      <v-card :loading="loading">
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Edit Vehicle</div>
            <v-btn icon @click="editVehicleDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-form ref="editForm" v-model="formValid" class="my-4">
            <v-row>
              <v-col cols="12" md="6">
                <label class="text-subtitle-2"
                  >Model <span class="red--text">*</span></label
                >
                <v-select
                  v-model="editVehicle.model_id"
                  :items="models"
                  item-text="model_name"
                  item-value="model_id"
                  outlined
                  dense
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-car"
                />
              </v-col>

              <v-col cols="12" md="6">
                <label class="text-subtitle-2"
                  >Registration Number <span class="red--text">*</span></label
                >
                <v-text-field
                  v-model="editVehicle.registration_number"
                  outlined
                  dense
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-card-text"
                />
              </v-col>

              <v-col cols="12" md="6">
                <label class="text-subtitle-2"
                  >Chassis Number <span class="red--text">*</span></label
                >
                <v-text-field
                  v-model="editVehicle.chassis_number"
                  outlined
                  dense
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-identifier"
                />
              </v-col>

              <v-col cols="12" md="6">
                <label class="text-subtitle-2"
                  >Engine Number <span class="red--text">*</span></label
                >
                <v-text-field
                  v-model="editVehicle.engine_number"
                  outlined
                  dense
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-engine"
                />
              </v-col>

              <v-col cols="12" md="6">
                <label class="text-subtitle-2"
                  >Status <span class="red--text">*</span></label
                >
                <v-select
                  v-model="editVehicle.status"
                  :items="statusOptions"
                  outlined
                  dense
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-flag"
                />
              </v-col>

              <v-col cols="12" md="6">
                <label class="text-subtitle-2"
                  >Vehicle Type <span class="red--text">*</span></label
                >
                <v-select
                  v-model="editVehicle.vehicle_type"
                  :items="vehicleTypes"
                  outlined
                  dense
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-motorcycle"
                />
              </v-col>

              <v-col cols="12">
                <label class="text-subtitle-2"
                  >Location <span class="red--text">*</span></label
                >
                <v-select
                  v-model="editVehicle.location_id"
                  :items="locations"
                  item-text="name"
                  item-value="location_id"
                  outlined
                  dense
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-map-marker"
                />
              </v-col>
            </v-row>
          </v-form>

          <!-- Buttons -->
          <div class="d-flex justify-end my-2">
            <v-btn text @click="editVehicleDialog = false" class="mr-2"
              >Cancel</v-btn
            >
            <v-btn color="primary" :disabled="!formValid" @click="updateVehicle"
              >Update</v-btn
            >
          </div>
        </v-container>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import HTTP from "@/plugins/axios";
import Swal from "sweetalert2";
import OverviewTab from "../Vehicles/VehicleTabs/OverView.vue";
import TraceTab from "../Vehicles/VehicleTabs/TraceTab.vue";
import BookingsTab from "../Vehicles/VehicleTabs/BookingsTab.vue";
import SettingsTab from "../Vehicles/VehicleTabs/SettingsTab.vue";

export default {
  name: "VehicleView",
  components: {
    OverviewTab,
    TraceTab,
    BookingsTab,
    SettingsTab,
  },
  data() {
    return {
      vehicle_id: "",
      vehicle: null,
      loading: false,
      activeTab: 0,
      editVehicleDialog: false,
      formValid: false,
      models: [],
      locations: [],
      editVehicle: {
        model_id: "",
        registration_number: "",
        chassis_number: "",
        engine_number: "",
        status: "",
        vehicle_type: "",
        location_id: "",
      },
      statusOptions: [
        { text: "Available", value: "available" },
        { text: "Rented", value: "rented" },
        { text: "Under Maintenance", value: "maintenance" },
        { text: "Hidden", value: "hidden" },
      ],
      vehicleTypes: [
        { text: "Bike", value: "Bike" },
        { text: "Scooter", value: "Scooter" },
      ],
      rules: {
        required: (v) => !!v || "This field is required",
      },
    };
  },
  computed: {
    breadcrumbItems() {
      return [
        {
          text: "Vehicles",
          to: "/vehicles",
          disabled: false,
        },
        {
          text: this.vehicle_id,
          to: `/vehicles/${this.vehicle_id}`,
          disabled: true,
        },
      ];
    },
    statusColor() {
      switch (this.vehicle?.status) {
        case "available":
          return "success";
        case "rented":
          return "error";
        case "maintenance":
          return "warning";
        default:
          return "grey";
      }
    },
  },
  created() {
    this.getVehicleModels();
    this.getProviderLocations();
  },
  mounted() {
    this.vehicle_id = this.$route.params.vehicle_id;
    this.loadVehicle();
  },
  methods: {
    async loadVehicle() {
      this.loading = true;
      try {
        const { data } = await HTTP.get(`/api/vehicle/${this.vehicle_id}`);
        this.vehicle = data.data;
        this.fillEditForm(this.vehicle);
      } catch (err) {
        console.error("Error loading vehicle:", err);
        Swal.fire("Error", "Failed to load vehicle details", "error");
      } finally {
        this.loading = false;
      }
    },
    fillEditForm(vehicle) {
      this.editVehicle = {
        model_id: vehicle.model_id,
        registration_number: vehicle.registration_number,
        chassis_number: vehicle.chassis_number,
        engine_number: vehicle.engine_number,
        vehicle_type: vehicle.vehicle_type,
        status: vehicle.status,
        location_id: vehicle.location_id,
      };
    },
    async updateVehicle() {
      if (!this.$refs.editForm.validate()) return;

      this.loading = true;
      try {
        await HTTP.put(`/vehicle/${this.vehicle.vehicle_id}`, {
          model_id: Number(this.editVehicle.model_id),
          registration_number: this.editVehicle.registration_number,
          chassis_number: this.editVehicle.chassis_number,
          engine_number: this.editVehicle.engine_number,
          status: this.editVehicle.status,
          vehicle_type: this.editVehicle.vehicle_type,
          location_id: Number(this.editVehicle.location_id),
        });

        this.editVehicleDialog = false;
        Swal.fire({
          icon: "success",
          title: "Vehicle updated successfully!",
          showConfirmButton: true,
          timer: 2000,
        });
        this.loadVehicle();
      } catch (err) {
        Swal.fire(
          "Error",
          err.response?.data?.message || "Failed to update vehicle",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },
    async getVehicleModels() {
      try {
        const { data } = await HTTP.get("/api/vehicle-models", {
          params: { limit: 20, offset: 0 },
        });
        this.models = data.data.models;
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    },
    async getProviderLocations() {
      try {
        const { data } = await HTTP.get("/api/locations", {
          params: { limit: 20, offset: 0 },
        });
        this.locations = data.data.locations;
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    },
    formatStatus(status) {
      return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString("en-GB");
    },
  },
};
</script>
