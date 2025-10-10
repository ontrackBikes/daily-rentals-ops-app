<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined rounded="lg" @click="statusDialog = true" class="py-2">
          <v-container
            ><div class="d-flex align-center justify-space-between">
              <h4>Change Status</h4>
              <div>
                <v-chip
                  :color="statusColor"
                  text-color="white"
                  small
                  class="ml-2"
                >
                  {{ formatStatus(vehicle.status) }}
                </v-chip>
                <v-icon>mdi-chevron-right</v-icon>
              </div>
            </div></v-container
          ></v-card
        >
      </v-col>
    </v-row>

    <!-- Status Change Dialog -->
    <v-dialog v-model="statusDialog" max-width="500px" persistent>
      <v-card>
        <v-container>
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Change Vehicle Status</div>
            <v-btn icon @click="statusDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <div>
            <v-radio-group v-model="selectedStatus">
              <v-radio
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
                color="primary"
              ></v-radio>
            </v-radio-group>
          </div>

          <div class="d-flex justify-end my-2">
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
          </div>
        </v-container>
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
