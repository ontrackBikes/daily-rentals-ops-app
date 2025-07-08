<template>
  <v-container>
    <!-- Header -->
    <v-card flat class="mb-4">
      <v-row align="center">
        <!-- Title -->
        <v-col cols="12" md="3">
          <div class="text-h6 font-weight-bold">
            Vehicle Fleet ({{ totalVehicles }})
          </div>
        </v-col>

        <!-- Controls -->
        <v-col cols="12" md="9">
          <v-row dense class="justify-end">
            <!-- Search -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="searchQuery"
                append-icon="mdi-magnify"
                placeholder="Search id, vehicle number & model name..."
                dense
                outlined
                hide-details
              />
            </v-col>

            <!-- Status Filter -->
            <v-col cols="12" md="4">
              <v-select
                v-model="selectedStatus"
                :items="statusOptions"
                label="Status"
                outlined
                dense
                hide-details
                @change="loadVehicles"
              />
            </v-col>

            <!-- Add Button -->
            <v-col cols="12" md="2">
              <v-btn @click="openDialog" color="primary" dark block>
                <v-icon left>mdi-plus</v-icon>
                Add
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>

    <!-- Vehicles Table with Pagination Style -->
    <v-card class="rounded-lg my-4" outlined :loading="isLoading">
      <v-simple-table>
        <thead>
          <tr>
            <th class="text-left">ID</th>
            <th class="text-left">Registration</th>
            <th class="text-left">Model</th>
            <th class="text-left">Type</th>
            <th class="text-left">Color</th>
            <th class="text-left">Status</th>
            <th class="text-left">Location</th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in vehicles" :key="vehicle.vehicle_id">
            <td>{{ vehicle.vehicle_id }}</td>
            <td>{{ vehicle.registration_number }}</td>
            <td>{{ vehicle.model_data.model_name }}</td>
            <td>{{ vehicle.model_data.engine_type }}</td>
            <td>
              <span
                class="d-inline-block rounded-circle mr-2"
                :style="{
                  backgroundColor: vehicle.color,
                  width: '12px',
                  height: '12px',
                }"
              ></span>
              {{ vehicle.color || "-" }}
            </td>
            <td>
              <v-chip
                small
                dark
                :color="getStatusColor(vehicle.status, 'vehicle')"
              >
                {{ vehicle.status }}
              </v-chip>
            </td>
            <td>{{ vehicle.location_data.name }}</td>
            <td>
              <v-btn
                small
                outlined
                color="primary"
                @click="viewVehicle(vehicle.vehicle_id)"
              >
                View
              </v-btn>
            </td>
          </tr>
          <tr v-if="!vehicles.length">
            <td colspan="8" class="text-center grey--text">
              No vehicles found.
            </td>
          </tr>
        </tbody>
      </v-simple-table>

      <v-divider></v-divider>
      <v-card-actions class="justify-center">
        <v-pagination
          v-model="page"
          :length="Math.ceil(totalVehicles / limit)"
          circle
          total-visible="5"
          @input="onPageChange"
        />
      </v-card-actions>
    </v-card>
    <v-dialog
      v-model="AddVehiclesDialog"
      max-width="800px"
      scrollable
      @input="onDialogToggle"
    >
      <v-card>
        <v-card-title class="headline">
          Add Vehicle
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <AddVehicle
            ref="addVehicleRef"
            @vehicle-added="onVehicleAdded"
            @close-dialog="closeDialog"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/plugins/axios";
import StatusService from "@/plugins/statusColor";
import { debounce } from "lodash";
import AddVehicle from "@/components/AddVehicles.vue";
export default {
  components: {
    AddVehicle,
  },
  data() {
    return {
      vehicles: [],
      totalVehicles: 0,
      page: 1,
      limit: 10,
      selectedStatus: "",
      isLoading: false,
      searchQuery: "",
      statusOptions: [
        { text: "All Vehicles", value: "" },
        { text: "Available", value: "available" },
        { text: "Rented", value: "rented" },
        { text: "Under Maintenance", value: "maintenance" },
        { text: "Hidden", value: "hidden" },
        { text: "On Hold", value: "on_hold" },
      ],
      AddVehiclesDialog: false,
    };
  },

  mounted() {
    this.loadVehicles();
  },

  watch: {
    searchQuery: debounce(function () {
      this.page = 1;
      this.loadVehicles();
    }, 500),
  },

  methods: {
    async loadVehicles() {
      this.isLoading = true;
      const offset = (this.page - 1) * this.limit;
      try {
        const { data } = await api.get("/api/vehicles", {
          params: {
            limit: this.limit,
            offset,
            status: this.selectedStatus || undefined,
            search: this.searchQuery || undefined,
          },
        });
        this.vehicles = data.data.vehicles;
        this.totalVehicles = data.data.meta.count;
      } catch (err) {
        console.error("Error loading vehicles:", err);
      } finally {
        this.isLoading = false;
      }
    },
    onPageChange() {
      this.loadVehicles();
    },
    viewVehicle(id) {
      this.$router.push("/vehicles/" + id);
    },
    formatStatus(status) {
      return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    },
    getStatusColor(status, type) {
      return StatusService.getColor(status, type);
    },
    openDialog() {
      this.AddVehiclesDialog = true;
    },
    closeDialog() {
      this.AddVehiclesDialog = false;
      this.$nextTick(() => {
        this.$refs.addVehicleRef?.resetForm?.();
      });
    },
    onDialogToggle(value) {
      if (!value) {
        this.closeDialog(); // called when clicked outside
      }
    },
    onVehicleAdded() {
      this.loadVehicles(); // Your existing method
      this.dialog = false; // Also close dialog (optional if already handled)
    },
  },
};
</script>

<style scoped></style>
