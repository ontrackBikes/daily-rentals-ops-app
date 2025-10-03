<template>
  <div>
    <!-- Trigger Card -->
    <v-card
      outlined
      class="pa-4 d-flex justify-space-between align-center"
      @click="openDialog"
      :loading="loading"
      style="cursor: pointer"
    >
      <span>{{ value?.name || "Select Location" }}</span>
      <v-icon right>mdi-chevron-down</v-icon>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search Location"
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
              v-for="location in filteredLocations"
              :key="location.location_id"
              @click="selectLocation(location)"
              class="hoverable"
            >
              <v-list-item-content>
                <v-list-item-title>{{ location.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ location.address || "No address" }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-if="!loading && filteredLocations.length === 0">
              <v-list-item-content>
                <v-list-item-title>No locations found</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-if="hasMore">
              <v-btn
                block
                rounded
                depressed
                text
                @click="loadMore"
                :loading="loading"
                >Load More</v-btn
              >
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text rounded depressed color="error" @click="dialog = false"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "SelectLocation",
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
      search: "",
      locations: [],
      offset: 0,
      limit: 20,
      total: 0,
      loading: false,
    };
  },
  computed: {
    filteredLocations() {
      if (!this.search) return this.locations;
      return this.locations.filter((l) =>
        l.name.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    hasMore() {
      return this.locations.length < this.total;
    },
  },
  methods: {
    openDialog() {
      this.dialog = true;
      if (this.locations.length === 0) this.fetchLocations();
    },
    async fetchLocations() {
      this.loading = true;
      try {
        const res = await api.get("/api/locations", {
          params: {
            ...this.params,
            limit: this.limit,
            offset: this.offset,
          },
        });

        const data = res.data?.data;
        this.total = data.meta.count || 0;
        this.locations.push(...data.locations);
        this.offset += this.limit;
      } catch (err) {
        console.error("Failed to fetch locations", err);
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.fetchLocations();
      }
    },
    selectLocation(location) {
      this.$emit("input", location); // v-model support
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
