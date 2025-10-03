<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title>
            <v-icon left>mdi-flag</v-icon>
            Status Management
          </v-card-title>
          <v-card-text class="pa-6">
            <div class="text-body-1 mb-4">
              Current Status:
              <v-chip
                :color="statusColor"
                text-color="white"
                small
                class="ml-2"
              >
                {{ formatStatus(vehicle.status) }}
              </v-chip>
            </div>
            <v-btn
              color="primary"
              @click="statusDialog = true"
              outlined
              rounded
              depressed
            >
              <v-icon left>mdi-pencil</v-icon>
              Change Status
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Status Change Dialog -->
    <v-dialog v-model="statusDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="primary white--text">
          <v-icon left color="white">mdi-flag</v-icon>
          Change Vehicle Status
          <v-spacer></v-spacer>
          <v-btn icon dark @click="statusDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="text-body-1 mb-4">Select new status for vehicle:</div>
          <v-radio-group v-model="selectedStatus">
            <v-radio
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
              color="primary"
            ></v-radio>
          </v-radio-group>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="statusDialog = false"
            :disabled="loading"
            rounded
            depressed
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="updateVehicleStatus"
            :loading="loading"
            :disabled="selectedStatus === vehicle.status"
            rounded
            depressed
          >
            Update Status
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import HTTP from "@/plugins/axios";
import Swal from "sweetalert2";

export default {
  name: "SettingsTab",
  props: {
    vehicle: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      statusDialog: false,
      selectedStatus: "",
      loading: false,
      statusOptions: [
        { value: "available", label: "Available" },
        { value: "rented", label: "Rented" },
        { value: "maintenance", label: "Under Maintenance" },
        { value: "hidden", label: "Hidden" },
      ],
    };
  },
  computed: {
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
  watch: {
    vehicle: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.selectedStatus = newVal.status;
        }
      },
    },
    statusDialog(val) {
      if (val) {
        this.selectedStatus = this.vehicle.status;
      }
    },
  },
  methods: {
    formatStatus(status) {
      return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    },
    async updateVehicleStatus() {
      try {
        const { isConfirmed } = await Swal.fire({
          title: "Confirm Status Change",
          text: `Change vehicle status to "${this.formatStatus(
            this.selectedStatus
          )}"?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, update it",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#1976d2",
        });

        if (!isConfirmed) {
          this.selectedStatus = this.vehicle.status;
          return;
        }

        this.loading = true;
        const response = await HTTP.patch(
          `/api/vehicle/${this.vehicle.vehicle_id}/status`,
          {
            vehicle_id: this.vehicle.vehicle_id,
            status: this.selectedStatus,
          }
        );

        this.statusDialog = false;
        this.$emit("status-updated");

        Swal.fire({
          title: "Success",
          text: response.data.message || "Vehicle status updated successfully.",
          icon: "success",
        });
      } catch (error) {
        console.error("Error updating vehicle status:", error);
        Swal.fire("Error", "Failed to update vehicle status.", "error");
        this.selectedStatus = this.vehicle.status;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
