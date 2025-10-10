<template>
  <v-container>
    <!-- Header -->
    <v-card flat class="mb-4">
      <v-row align="center">
        <!-- Title -->
        <v-col cols="12" md="3">
          <div class="text-h6 font-weight-bold">
            Vehicle Models ({{ totalModels }})
          </div>
        </v-col>

        <!-- Controls -->
        <v-col cols="12" md="9">
          <v-row dense class="justify-end">
            <!-- Search -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model="searchQuery"
                append-icon="mdi-magnify"
                placeholder="Search id, model name..."
                dense
                outlined
                hide-details
                class="rounded-lg"
              />
            </v-col>

            <!-- Make Filter -->
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedMake"
                :items="makeOptions"
                label="Make"
                outlined
                dense
                hide-details
                @change="loadModels"
                class="rounded-lg"
              />
            </v-col>

            <!-- Status Filter -->
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedStatus"
                :items="statusOptions"
                label="Status"
                outlined
                dense
                hide-details
                @change="loadModels"
                class="rounded-lg"
              />
            </v-col>

            <!-- Add Button -->
            <v-col cols="12" md="2">
              <v-btn
                rounded
                depressed
                @click="openDialog"
                color="primary"
                dark
                block
              >
                <v-icon left>mdi-plus</v-icon>
                Add
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>

    <!-- Models Table -->
    <v-card class="rounded-lg my-4" outlined :loading="isLoading">
      <v-simple-table>
        <thead>
          <tr>
            <th class="text-left">ID</th>
            <th class="text-left">Model Name</th>
            <th class="text-left">Start Type</th>
            <th class="text-left">Manufacturer</th>
            <th class="text-left">Status</th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="model in models" :key="model.model_id">
            <td>{{ model.model_id }}</td>
            <td>{{ model.model_name }}</td>
            <td>{{ model.start_type }}</td>
            <td>{{ model.make }}</td>
            <td>
              <v-chip small dark :color="getStatusColor(model.status, 'model')">
                {{ formatStatus(model.status) }}
              </v-chip>
            </td>
            <td>
              <v-btn
                small
                outlined
                color="primary"
                rounded
                @click="viewModel(model.model_id)"
              >
                View
              </v-btn>
              <v-btn icon="mdi-pencil"></v-btn>
            </td>
          </tr>
          <tr v-if="!models.length">
            <td colspan="6" class="text-center grey--text">No models found.</td>
          </tr>
        </tbody>
      </v-simple-table>

      <v-divider></v-divider>
      <v-card-actions class="justify-center">
        <v-pagination
          v-model="page"
          :length="Math.ceil(totalModels / limit)"
          circle
          total-visible="5"
          @input="onPageChange"
        />
      </v-card-actions>
    </v-card>

    <!-- Add Model Dialog -->
    <v-dialog
      v-model="AddModelDialog"
      max-width="600px"
      scrollable
      @input="onDialogToggle"
    >
      <v-card>
        <div class="d-flex justify-space-between align-center pa-2 px-3">
          <div class="text-h6 font-weight-bold">Add Model</div>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="pa-0">
          <AddModel
            ref="addModelRef"
            @model-added="onModelAdded"
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
import AddModel from "@/components/AddModel.vue";

export default {
  components: {
    AddModel,
  },
  data() {
    return {
      models: [],
      totalModels: 0,
      page: 1,
      limit: 10,
      selectedStatus: "",
      selectedMake: "",
      isLoading: false,
      searchQuery: "",
      statusOptions: [
        { text: "All Status", value: "" },
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
        { text: "Deprecated", value: "deprecated" },
      ],
      makeOptions: [{ text: "All Makes", value: "" }],
      AddModelDialog: false,
    };
  },

  mounted() {
    this.loadMakeOptions();
    this.loadModels();
  },

  watch: {
    searchQuery: debounce(function () {
      this.page = 1;
      this.loadModels();
    }, 500),
  },

  methods: {
    async loadMakeOptions() {
      try {
        const { data } = await api.get("/api/vehicle-models", {
          params: { limit: 1000 }, // fetch enough to get all unique makes
        });
        const models = data.data.models || [];
        const makes = Array.from(new Set(models.map((m) => m.make))).sort();
        // Populate makeOptions
        this.makeOptions = [
          { text: "All Makes", value: "" },
          ...makes.map((m) => ({ text: m, value: m })),
        ];
      } catch (err) {
        console.error("Error fetching makes:", err);
      }
    },
    async loadModels() {
      this.isLoading = true;
      const offset = (this.page - 1) * this.limit;
      try {
        const { data } = await api.get("/api/vehicle-models", {
          params: {
            limit: this.limit,
            offset,
            search: this.searchQuery || undefined,
            make: this.selectedMake || undefined,
            status: this.selectedStatus || undefined,
          },
        });
        this.models = data.data.models;
        this.totalModels = data.data.meta.total;
      } catch (err) {
        console.error("Error loading models:", err);
      } finally {
        this.isLoading = false;
      }
    },
    onPageChange() {
      this.loadModels();
    },
    viewModel(id) {
      this.$router.push("/models/" + id);
    },
    formatStatus(status) {
      return status
        ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : "-";
    },
    getStatusColor(status, type) {
      return StatusService.getColor(status, type);
    },
    openDialog() {
      this.AddModelDialog = true;
    },
    closeDialog() {
      this.AddModelDialog = false;
      this.$nextTick(() => {
        this.$refs.addModelRef?.resetForm?.();
      });
    },
    onDialogToggle(value) {
      if (!value) {
        this.closeDialog();
      }
    },
    onModelAdded() {
      this.loadModels();
      this.AddModelDialog = false;
    },
  },
};
</script>
