<template>
  <div>
    <!-- Trigger -->
    <v-card
      outlined
      class="pa-4 d-flex justify-space-between align-center hoverable"
      :loading="loading"
      @click="openDialog"
    >
      <span>
        {{ value?.registration_number || "Select Available Vehicle" }}
      </span>
      <v-icon right>mdi-chevron-down</v-icon>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card :loading="loading">
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Select Vehicle</div>
            <v-btn icon @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Search -->
          <v-form class="my-4">
            <div class="mb-3">
              <v-text-field
                v-model="localSearch"
                prepend-inner-icon="mdi-magnify"
                outlined
                dense
                hide-details
                placeholder="Search by model or registration number"
              />
            </div>
          </v-form>

          <!-- Vehicle List -->
          <div style="max-height: 400px; overflow-y: auto">
            <v-list>
              <v-list-item
                v-for="vehicle in filteredVehicles"
                :key="vehicle.vehicle_id"
                @click="selectVehicle(vehicle)"
                class="hoverable"
              >
                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">
                    {{ vehicle.model_data?.model_name || "Unknown" }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ vehicle.registration_number }} •
                    {{ vehicle.model_data?.make || "-" }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip
                    small
                    color="indigo"
                    text-color="white"
                    v-if="vehicle.status"
                  >
                    {{ vehicle.status }}
                  </v-chip>
                </v-list-item-action>
              </v-list-item>

              <!-- No Result -->
              <div
                v-if="!filteredVehicles.length && !loading"
                class="text-center pa-4"
              >
                <v-icon size="36" color="grey lighten-1">mdi-car-off</v-icon>
                <div class="mt-2 font-weight-medium grey--text">
                  No vehicles found
                </div>
              </div>
            </v-list>

            <!-- Infinite scroll -->
            <div
              v-if="!allLoaded && filteredVehicles.length"
              v-intersect="{
                handler: loadMore,
                options: { threshold: 0.5 },
              }"
              class="text-center py-2"
            >
              <v-progress-circular
                indeterminate
                color="primary"
                v-if="loadingMore"
              />
            </div>

            <!-- Load More fallback -->
            <div class="text-center" v-if="!allLoaded && !loadingMore">
              <v-btn small rounded depressed @click="loadMore">Load More</v-btn>
            </div>
          </div>

          <!-- Actions -->
          <div class="d-flex justify-end my-2">
            <v-btn text rounded depressed color="error" @click="dialog = false"
              >Cancel</v-btn
            >
          </div>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "SelectVehicle",
  props: {
    value: {
      type: Object,
      default: null,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      dialog: false,
      localSearch: "",
      vehicles: [],
      offset: 0,
      limit: 10,
      total: 0,
      loading: false,
      loadingMore: false,
    };
  },
  computed: {
    filteredVehicles() {
      const searchTerm = this.localSearch.toLowerCase();
      return this.vehicles.filter((v) => {
        const name = v.model_data?.model_name?.toLowerCase() || "";
        const reg = v.registration_number?.toLowerCase() || "";
        return name.includes(searchTerm) || reg.includes(searchTerm);
      });
    },
    allLoaded() {
      return this.vehicles.length >= this.total;
    },
  },
  methods: {
    openDialog() {
      this.dialog = true;
      this.resetData();
      this.fetchVehicles();
    },
    resetData() {
      this.offset = 0;
      this.total = 0;
      this.vehicles = [];
      this.localSearch = "";
    },
    async fetchVehicles() {
      this.loading = true;
      try {
        const res = await api.get("/api/vehicles", {
          params: {
            ...this.params,
            limit: this.limit,
            offset: this.offset,
          },
        });
        const data = res.data?.data;
        this.vehicles = [...this.vehicles, ...(data?.vehicles || [])];
        this.total = Number(data?.meta?.count || 0);
        this.offset += this.limit;
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      } finally {
        this.loading = false;
      }
    },
    async loadMore() {
      if (this.allLoaded || this.loadingMore) return;

      this.loadingMore = true;
      try {
        const res = await api.get("/api/vehicles", {
          params: {
            ...this.params,
            limit: this.limit,
            offset: this.offset,
          },
        });
        const data = res.data?.data;
        this.vehicles = [...this.vehicles, ...(data?.vehicles || [])];
        this.total = Number(data?.meta?.count || 0);
        this.offset += this.limit;
      } catch (err) {
        console.error("Load more error:", err);
      } finally {
        this.loadingMore = false;
      }
    },
    selectVehicle(vehicle) {
      this.$emit("input", vehicle);
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
