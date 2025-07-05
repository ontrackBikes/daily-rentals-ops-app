<template>
  <div>
    <!-- Trigger Card -->
    <v-card
      :loading="loading"
      outlined
      @click="getDataAndOpenDialog"
      style="cursor: pointer"
    >
      <div class="pa-4 d-flex justify-space-between align-center">
        <span>{{ value?.model_name || "Select Model" }}</span>
        <v-icon right>mdi-chevron-down</v-icon>
      </div>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card :loading="loading" min-height="300px">
        <v-card-title>
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search Model"
            dense
            outlined
            hide-details
            class="flex-grow-1"
          />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-list>
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
                <v-chip color="green" text-color="white" small>
                  {{ model.available_vehicle_count }} available
                </v-chip>
              </v-list-item-action>
            </v-list-item>

            <v-list-item v-if="!filteredModels.length && !loading">
              <v-list-item-content>
                <v-list-item-title>No vehicles found</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text color="error" @click="dialog = false">Cancel</v-btn>
        </v-card-actions>
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
      return this.models.filter((m) =>
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
      this.$emit("input", model); // v-model support
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
