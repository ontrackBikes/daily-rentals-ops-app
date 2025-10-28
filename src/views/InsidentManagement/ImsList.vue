<template>
  <v-container>
    <!-- Header + Filters -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="4">
        <div class="text-h6 font-weight-bold">Incidents ({{ total }})</div>
      </v-col>

      <!-- Status Filter -->
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedStatus"
          :items="statusOptions"
          label="Status"
          dense
          outlined
          hide-details
          class="rounded-lg"
          @change="fetchIncidents"
        />
      </v-col>

      <!-- Type Filter -->
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedType"
          :items="typeOptions"
          label="Type"
          dense
          outlined
          hide-details
          class="rounded-lg"
          @change="fetchIncidents"
        />
      </v-col>

      <!-- Add Button -->
      <v-col cols="12" md="2" class="d-flex justify-end">
        <v-btn
          color="primary"
          dark
          rounded
          depressed
          @click="openDialog = true"
        >
          <v-icon left>mdi-plus</v-icon>
          Add Incident
        </v-btn>
      </v-col>
    </v-row>

    <!-- Table -->
    <v-card outlined class="rounded-lg" :loading="loading">
      <v-skeleton-loader
        v-if="loading"
        type="table-thead, table-row@6"
        class="mx-2 my-4"
      />
      <v-simple-table v-else>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Customer ID</th>
            <th>Booking ID</th>
            <th>Description</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="incident in incidents" :key="incident.id">
            <td>{{ incident.incident_id }}</td>
            <td>{{ incident.type }}</td>
            <td>
              <v-chip :color="getStatusColor(incident.status)" small>
                {{ incident.status }}
              </v-chip>
            </td>
            <td>
              <v-chip :color="getPriorityColor(incident.priority)" small>
                {{ incident.priority }}
              </v-chip>
            </td>
            <td>{{ incident.customer_id }}</td>
            <td>{{ incident.booking_id }}</td>
            <td>{{ incident.description }}</td>
            <td>{{ incident.created_at | moment }}</td>
            <td>
              <v-btn
                small
                outlined
                color="primary"
                rounded
                @click="viewIms(incident.incident_id)"
              >
                View
              </v-btn>
            </td>
          </tr>
          <tr v-if="!incidents.length">
            <td colspan="8" class="text-center grey--text">
              No incidents found.
            </td>
          </tr>
        </tbody>
      </v-simple-table>

      <!-- Pagination -->
      <v-divider></v-divider>
      <v-card-actions class="justify-center">
        <v-pagination
          v-model="page"
          :length="pageCount"
          circle
          total-visible="5"
          @input="fetchIncidents"
        />
      </v-card-actions>
    </v-card>

    <!-- Add Incident Dialog -->
    <v-dialog v-model="openDialog" max-width="600px">
      <v-card :loading="dialogLoading" class="rounded-lg pa-4">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-2">
          <div class="text-h6 font-weight-bold">Add Incident</div>
          <v-btn icon @click="openDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <!-- Form -->
        <v-form ref="form" v-model="formValid">
          <v-row dense>
            <v-col cols="12" md="6">
              <label class="text-subtitle-2">Type</label>
              <v-select
                v-model="form.type"
                :items="typeOptions"
                dense
                outlined
                :rules="[rules.required]"
                hide-details
              />
            </v-col>

            <v-col cols="12" md="6">
              <label class="text-subtitle-2">Priority</label>
              <v-select
                v-model="form.priority"
                :items="priorityOptions"
                dense
                outlined
                :rules="[rules.required]"
                hide-details
              />
            </v-col>

            <v-col cols="12" md="6">
              <label class="text-subtitle-2">Customer ID</label>
              <v-text-field
                v-model="form.customer_id"
                dense
                outlined
                :rules="[rules.required, rules.numeric]"
                hide-details
              />
            </v-col>

            <v-col cols="12" md="6">
              <label class="text-subtitle-2">Booking ID</label>
              <v-text-field
                v-model="form.booking_id"
                dense
                outlined
                :rules="[rules.required, rules.numeric]"
                hide-details
              />
            </v-col>

            <v-col cols="12">
              <label class="text-subtitle-2">Description</label>
              <v-textarea
                v-model="form.description"
                dense
                outlined
                rows="3"
                :rules="[rules.required]"
                hide-details
              />
            </v-col>
          </v-row>
        </v-form>

        <!-- Action Buttons -->
        <div class="d-flex justify-end mt-3">
          <v-btn text rounded class="mr-2" @click="openDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            rounded
            :disabled="!formValid"
            @click="createIncident"
          >
            Create
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "IncidentList",
  data() {
    return {
      loading: false,
      dialogLoading: false,
      incidents: [],
      total: 0,
      page: 1,
      limit: 10,
      pageCount: 1,

      // Filters
      selectedStatus: "open",
      selectedType: "booking",
      statusOptions: [
        { text: "All", value: "" },
        { text: "Open", value: "open" },
        { text: "In Progress", value: "in_progress" },
        { text: "Closed", value: "closed" },
        { text: "Resolved", value: "resolved" },
      ],
      typeOptions: [
        "booking",
        "customer_query",
        "general",
        "expired_booking",
        "due_expiry",
      ],
      priorityOptions: ["low", "medium", "high"],

      // Dialog
      openDialog: false,
      formValid: false,
      form: {
        type: "booking",
        customer_id: "",
        booking_id: "",
        priority: "high",
        description: "",
      },

      rules: {
        required: (v) => !!v || "Required.",
        numeric: (v) => /^\d+$/.test(v) || "Must be numeric",
      },
    };
  },

  mounted() {
    this.fetchIncidents();
  },

  methods: {
    async fetchIncidents() {
      this.loading = true;
      //   const offset = (this.page - 1) * this.limit;

      try {
        const { data } = await api.get("/api/incidents", {
          params: {
            status: this.selectedStatus || undefined,
            type: this.selectedType || undefined,
            priority: "high",
            page: this.page,

            limit: this.limit,
            sort_by: "created_at",
            sort_order: "DESC",
          },
        });

        this.incidents = data?.data?.incidents || [];
        this.total = data?.data?.meta?.count || 0;
        this.pageCount = Math.ceil(this.total / this.limit) || 1;
      } catch (err) {
        console.error("Error fetching incidents:", err);
        this.$swal.fire({
          icon: "error",
          title: "Failed",
          text: err.response?.data?.message || "Could not load incidents.",
        });
      } finally {
        this.loading = false;
      }
    },

    async createIncident() {
      if (!this.$refs.form.validate()) return;
      this.dialogLoading = true;

      try {
        await api.post("/api/incident", this.form);
        this.openDialog = false;
        this.$refs.form.reset();
        this.fetchIncidents();

        this.$swal.fire({
          icon: "success",
          title: "Incident Created",
          text: "New incident has been logged successfully.",
          confirmButtonColor: "#1976d2",
        });
      } catch (err) {
        console.error("Error creating incident:", err);
        this.$swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "Failed to create incident.",
        });
      } finally {
        this.dialogLoading = false;
      }
    },

    getStatusColor(status) {
      switch (status) {
        case "open":
          return "orange";
        case "closed":
          return "green";
        case "resolved":
          return "blue";
        default:
          return "grey";
      }
    },

    getPriorityColor(priority) {
      switch (priority) {
        case "high":
          return "red";
        case "medium":
          return "orange";
        case "low":
          return "green";
        default:
          return "grey";
      }
    },
    viewIms(id) {
      this.$router.push(`/ims/${id}`);
    },
  },
};
</script>

<style scoped></style>
