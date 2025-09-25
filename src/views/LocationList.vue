<template>
  <v-container>
    <div>
      <!-- Header: Title + Search + Add -->
      <v-row class="align-center">
        <v-col cols="12" md="6">
          <div class="text-h6 font-weight-bold">Locations ({{ total }})</div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="d-flex justify-end align-center">
            <v-text-field
              v-model="searchQuery"
              append-icon="mdi-magnify"
              placeholder="Search by location name, address & pincode."
              dense
              hide-details
              outlined
              class="mr-4"
              @input="onSearchInput"
              @keyup.enter="fetchLocations"
            />
            <v-btn depressed color="primary" dark @click="openAddDialog">
              <v-icon left>mdi-plus</v-icon> Add location
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Locations Table -->
      <v-card class="rounded-lg my-4" outlined :loading="loading">
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">Name</th>
              <th class="text-left">Contact</th>
              <th class="text-left">Address</th>
              <th class="text-left">Created At</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="location in locations" :key="location.location_id">
              <td>{{ location.location_id }}</td>
              <td>
                <LocationViewer :location="location" />
              </td>

              <td>{{ location.contact_number }}</td>
              <td>{{ location.address }}</td>
              <td>{{ location.created_at | moment }}</td>
              <td>
                <v-btn
                  small
                  icon
                  color="primary"
                  @click="openEditDialog(location)"
                  class="mr-2"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </td>
            </tr>
            <tr v-if="!locations.length">
              <td colspan="7" class="text-center grey--text">
                No locations found.
              </td>
            </tr>
          </tbody>
        </v-simple-table>

        <!-- Pagination -->
        <v-divider />
        <v-card-actions class="justify-center">
          <v-pagination
            v-model="page"
            :length="pageCount"
            circle
            total-visible="5"
            @input="fetchLocations"
          />
        </v-card-actions>
      </v-card>
    </div>

    <!-- Combined Add/Edit Location Dialog -->
    <v-dialog v-model="openLocationDialog" max-width="700px">
      <v-card :loading="loading">
        <v-container class="px-4">
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">
              {{ isEditMode ? "Update Location" : "Add Location" }}
            </div>
            <v-btn icon @click="closeDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Form -->
          <div class="my-4">
            <v-form ref="form" v-model="formValid">
              <!-- Name -->
              <div class="my-2">
                <label class="text-subtitle-2 font-weight-medium">
                  Name <span class="red--text">*</span>
                </label>
                <v-text-field
                  v-model="form.name"
                  :rules="[rules.required]"
                  required
                  outlined
                  dense
                  hide-details="auto"
                />
              </div>

              <!-- Address -->
              <div class="my-2">
                <label class="text-subtitle-2 font-weight-medium">
                  Address <span class="red--text">*</span>
                </label>
                <v-textarea
                  v-model="form.address"
                  :rules="[rules.required]"
                  outlined
                  dense
                  rows="2"
                  hide-details="auto"
                />
              </div>

              <!-- Contact -->
              <div class="my-2">
                <label class="text-subtitle-2 font-weight-medium">
                  Contact Number <span class="red--text">*</span>
                </label>
                <v-text-field
                  v-model="form.contact_number"
                  type="tel"
                  :rules="[rules.required, rules.contact]"
                  outlined
                  dense
                  hide-details="auto"
                />
              </div>

              <!-- City & Postal Code -->
              <v-row dense>
                <v-col cols="6">
                  <label class="text-subtitle-2 font-weight-medium">
                    City <span class="red--text">*</span>
                  </label>
                  <v-select
                    v-model="form.city_id"
                    :items="cities"
                    item-text="city_name"
                    item-value="city_id"
                    :rules="[rules.required]"
                    outlined
                    dense
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="6">
                  <label class="text-subtitle-2 font-weight-medium">
                    Postal Code <span class="red--text">*</span>
                  </label>
                  <v-text-field
                    v-model="form.postal_code"
                    :rules="[rules.required, rules.pincode]"
                    outlined
                    dense
                    hide-details="auto"
                  />
                </v-col>
              </v-row>

              <!-- Coordinates -->
              <v-row dense>
                <v-col cols="6">
                  <label class="text-subtitle-2 font-weight-medium">
                    Latitude
                  </label>
                  <v-text-field
                    v-model="form.latitude"
                    outlined
                    dense
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="6">
                  <label class="text-subtitle-2 font-weight-medium">
                    Longitude
                  </label>
                  <v-text-field
                    v-model="form.longitude"
                    outlined
                    dense
                    hide-details="auto"
                  />
                </v-col>
              </v-row>

              <!-- Pickup / Drop / Service Times -->
              <v-row dense>
                <v-col cols="6">
                  <label class="text-subtitle-2 font-weight-medium"
                    >Pickup Start Time</label
                  >
                  <v-text-field
                    v-model="form.pickup_start_time"
                    type="time"
                    outlined
                    dense
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="6">
                  <label class="text-subtitle-2 font-weight-medium"
                    >Pickup End Time</label
                  >
                  <v-text-field
                    v-model="form.pickup_end_time"
                    type="time"
                    outlined
                    dense
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="6">
                  <label class="text-subtitle-2 font-weight-medium"
                    >Drop Start Time</label
                  >
                  <v-text-field
                    v-model="form.drop_start_time"
                    type="time"
                    outlined
                    dense
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="6">
                  <label class="text-subtitle-2 font-weight-medium"
                    >Drop End Time</label
                  >
                  <v-text-field
                    v-model="form.drop_end_time"
                    type="time"
                    outlined
                    dense
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="6">
                  <label class="text-subtitle-2 font-weight-medium"
                    >Service Start Time</label
                  >
                  <v-text-field
                    v-model="form.service_start_time"
                    type="time"
                    outlined
                    dense
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="6">
                  <label class="text-subtitle-2 font-weight-medium"
                    >Service End Time</label
                  >
                  <v-text-field
                    v-model="form.service_end_time"
                    type="time"
                    outlined
                    dense
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="6">
                  <label class="text-subtitle-2 font-weight-medium"
                    >Service Days</label
                  >
                  <v-text-field
                    v-model="form.service_days"
                    outlined
                    dense
                    hide-details="auto"
                  />
                </v-col>

                <v-col cols="6" class="mt-3">
                  <v-switch
                    v-model="form.is_active"
                    label="Is Active"
                    color="success"
                    inset
                    class="ml-2"
                  />
                </v-col>
              </v-row>

              <!-- Notes -->
              <div>
                <label class="text-subtitle-2 font-weight-medium">Notes</label>
                <v-textarea
                  v-model="form.notes"
                  outlined
                  dense
                  rows="2"
                  hide-details="auto"
                />
              </div>
            </v-form>
          </div>

          <!-- Actions -->
          <div class="d-flex justify-end my-2">
            <v-btn text class="mr-2" @click="closeDialog">Cancel</v-btn>
            <v-btn
              color="primary"
              :disabled="!formValid"
              @click="isEditMode ? updateLocation() : createLocation()"
            >
              {{ isEditMode ? "Update" : "Add" }}
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/plugins/axios";
import debounce from "lodash/debounce";
import LocationViewer from "@/components/LocationViewer.vue";

export default {
  name: "locationList",
  components: { LocationViewer },
  data() {
    return {
      loading: false,
      locations: [],
      total: 0,
      page: 1,
      limit: 10,
      pageCount: 1,
      searchQuery: "",
      openLocationDialog: false,
      isEditMode: false,
      formValid: false,
      form: {
        location_id: null,
        name: "",
        address: "",
        postal_code: "",
        city_id: null,
        contact_number: "",
        latitude: "",
        longitude: "",
        pickup_start_time: "08:00",
        pickup_end_time: "20:00",
        drop_start_time: "08:00",
        drop_end_time: "20:00",
        service_start_time: "09:00",
        service_end_time: "18:00",
        service_days: "Mon-Fri",
        is_active: true,
        notes: "",
      },
      cities: [],
      rules: {
        required: (v) => !!v || "Required.",
        contact: (v) => /^\d{10}$/.test(v) || "Must be exactly 10 digits",
        pincode: (v) => /^\d{6}$/.test(v) || "Must be a valid 6-digit pincode",
      },
    };
  },
  watch: {
    searchQuery: {
      handler: "onSearchInput",
    },
  },
  created() {
    this.onSearchInput = debounce(this.fetchLocations, 400);
  },
  mounted() {
    this.fetchLocations();
    this.fetchCities();
  },
  methods: {
    async fetchCities() {
      try {
        const { data } = await api.get("/api/cities");
        this.cities = data?.data?.cities || [];
      } catch (err) {
        console.error("Cities fetch error:", err);
      }
    },
    async fetchLocations() {
      this.loading = true;
      const offset = (this.page - 1) * this.limit;
      try {
        const { data } = await api.get("/api/locations", {
          params: {
            limit: this.limit,
            offset,
            search: this.searchQuery || undefined,
          },
        });
        this.locations = data?.data?.locations || [];
        this.total = data?.data?.meta?.total || 0;
        this.pageCount = Math.ceil(this.total / this.limit) || 1;
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        this.loading = false;
      }
    },
    openAddDialog() {
      this.resetForm();
      this.isEditMode = false;
      this.openLocationDialog = true;
    },
    openEditDialog(location) {
      this.form = { ...location };
      this.isEditMode = true;
      this.openLocationDialog = true;
    },
    closeDialog() {
      this.openLocationDialog = false;
      this.resetForm();
    },
    resetForm() {
      this.form = {
        location_id: null,
        name: "",
        address: "",
        postal_code: "",
        city_id: null,
        contact_number: "",
        latitude: "",
        longitude: "",
        pickup_start_time: "08:00",
        pickup_end_time: "20:00",
        drop_start_time: "08:00",
        drop_end_time: "20:00",
        service_start_time: "09:00",
        service_end_time: "18:00",
        service_days: "Mon-Fri",
        is_active: true,
        notes: "",
      };
      this.formValid = false;
    },
    async createLocation() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      try {
        await api.post("/api/location", this.form);
        this.closeDialog();
        this.fetchLocations();
        this.$swal.fire("Success", "Location created successfully!", "success");
      } catch (err) {
        this.$swal.fire(
          "Error",
          err.response?.data?.message || "Something went wrong!",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },
    async updateLocation() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      try {
        await api.put(`/api/location/${this.form.location_id}`, this.form);
        this.closeDialog();
        this.fetchLocations();
        this.$swal.fire("Success", "Location updated successfully!", "success");
      } catch (err) {
        this.$swal.fire(
          "Error",
          err.response?.data?.message || "Failed to update location.",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped></style>
