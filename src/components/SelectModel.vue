<template>
  <div>
    <!-- Trigger Card -->
    <v-card
      outlined
      :loading="loading"
      @click="getDataAndOpenDialog"
      class="hoverable"
    >
      <div class="pa-4 d-flex justify-space-between align-center">
        <span>{{ value?.model_name || "Select Model" }}</span>
        <v-icon right>mdi-chevron-down</v-icon>
      </div>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card :loading="loading">
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Select Vehicle Model</div>
            <v-btn icon @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Search -->
          <v-form class="my-4">
            <div class="mb-3">
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                outlined
                dense
                hide-details
                placeholder="Type model name..."
              />
            </div>
          </v-form>

          <!-- List -->
          <div>
            <v-list class="rounded" two-line>
              <!-- Available Models -->
              <v-list-item
                v-for="model in filteredModels"
                :key="model.model_id"
                @click="selectVehicleModel(model)"
                class="hoverable"
              >
                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">
                    {{ model.model_name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ model.make }} • {{ model.year }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip
                    small
                    color="green"
                    text-color="white"
                    v-if="model.available_vehicle_count > 0"
                  >
                    {{ model.available_vehicle_count }} available
                  </v-chip>
                </v-list-item-action>
              </v-list-item>

              <!-- No Result -->
              <div
                v-if="!filteredModels.length && !loading"
                class="text-center pa-4"
              >
                <v-icon size="36" color="grey lighten-1">mdi-car-off</v-icon>
                <div class="mt-2 font-weight-medium grey--text">
                  No models found
                </div>
              </div>
            </v-list>
          </div>

          <!-- Actions -->
          <div class="d-flex justify-end my-2">
            <v-btn text @click="dialog = false" class="mr-2">Cancel</v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "SelectModel",
  props: {
    value: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      dialog: false,
      search: "",
      models: [],
      loading: false,
      hasFetched: false,
    };
  },
  computed: {
    filteredModels() {
      return this.models
        .filter((m) => m.status === "active" && m.available_vehicle_count > 0)
        .filter((m) =>
          m.model_name.toLowerCase().includes(this.search.toLowerCase())
        );
    },
  },
  methods: {
    async getDataAndOpenDialog() {
      if (!this.hasFetched) {
        this.loading = true;
        try {
          const res = await api.get("/api/vehicle-models");
          this.models = res.data?.data?.models || [];
          this.hasFetched = true;
        } catch (err) {
          console.error("Failed to fetch vehicle models", err);
        } finally {
          this.loading = false;
          this.dialog = true;
        }
      } else {
        this.dialog = true;
      }
    },
    selectVehicleModel(model) {
      this.$emit("input", model);
      this.dialog = false;
    },
  },
};
</script>

<style scoped>
.hoverable {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.hoverable:hover {
  background-color: #f5f5f5;
}
</style>
