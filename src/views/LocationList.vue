<template>
  <v-container>
    <div>
      <v-row class="align-center">
        <!-- Left: Title -->
        <v-col cols="12" md="6">
          <div class="text-h6 font-weight-bold">Locations ({{ total }})</div>
        </v-col>

        <!-- Right: Search and Add Button -->
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
            <v-btn
              depressed
              color="primary"
              dark
              @click="openAddLocationDialog = true"
            >
              <v-icon left>mdi-plus</v-icon>
              Add location
            </v-btn>
          </div>
        </v-col>
      </v-row>

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
            <tr v-for="location in locations" :key="location.id">
              <td>{{ location.location_id }}</td>
              <td>{{ location.name }}</td>
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

        <v-divider></v-divider>
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

    <!-- Add location dialog -->
    <v-dialog v-model="openAddLocationDialog" max-width="500px">
      <v-card :loading="loading">
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Add location</div>
            <v-btn icon @click="openAddLocationDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Form -->
          <div class="my-4">
            <v-form ref="form" v-model="formValid">
              <!-- Name -->
              <label class="text-subtitle-2">
                Name <span class="red--text">*</span>
              </label>
              <div class="mb-3">
                <v-text-field
                  v-model="form.name"
                  :rules="[rules.required]"
                  required
                  outlined
                  dense
                  hide-details
                />
              </div>

              <!-- Address -->
              <label class="text-subtitle-2">
                Address <span class="red--text">*</span>
              </label>
              <div class="mb-3">
                <v-textarea
                  v-model="form.address"
                  :rules="[rules.required]"
                  outlined
                  dense
                  rows="2"
                  hide-details
                />
              </div>

              <!-- Pincode -->
              <label class="text-subtitle-2">
                Pincode <span class="red--text">*</span>
              </label>
              <div class="mb-3">
                <v-text-field
                  v-model="form.pincode"
                  type="tel"
                  :rules="[rules.required, rules.pincode]"
                  required
                  outlined
                  dense
                  hide-details
                />
              </div>

              <!-- Contact Number -->
              <label class="text-subtitle-2">
                Contact Number <span class="red--text">*</span>
              </label>
              <div class="mb-3">
                <v-text-field
                  v-model="form.contact_number"
                  type="tel"
                  :rules="[rules.required, rules.contact]"
                  required
                  outlined
                  dense
                  hide-details
                />
              </div>

              <!-- Latitude & Longitude in one row -->
              <label class="text-subtitle-2">Coordinates</label>
              <v-row dense class="mb-3">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.latitude"
                    label="Latitude"
                    type="text"
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.longitude"
                    label="Longitude"
                    type="text"
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-form>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex justify-end my-2">
            <v-btn text @click="openAddLocationDialog = false" class="mr-2"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              :disabled="!formValid"
              @click="createlocation"
            >
              Add
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <!-- Edit Location Dialog -->
    <v-dialog v-model="openUpadateLocationDialog" max-width="500px">
      <v-card :loading="loading">
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Update Location</div>
            <v-btn icon @click="openUpadateLocationDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Form -->
          <div class="my-4">
            <v-form ref="editForm" v-model="formValid">
              <label class="text-subtitle-2">
                Name <span class="red--text">*</span>
              </label>
              <div class="mb-3">
                <v-text-field
                  v-model="editLocation.name"
                  :rules="[rules.required]"
                  required
                  outlined
                  dense
                  hide-details
                />
              </div>

              <label class="text-subtitle-2">
                Address <span class="red--text">*</span>
              </label>
              <div class="mb-3">
                <v-textarea
                  v-model="editLocation.address"
                  :rules="[rules.required]"
                  outlined
                  dense
                  rows="2"
                  hide-details
                />
              </div>

              <label class="text-subtitle-2">
                Pincode <span class="red--text">*</span>
              </label>
              <div class="mb-3">
                <v-text-field
                  v-model="editLocation.pincode"
                  :rules="[rules.required, rules.pincode]"
                  type="tel"
                  required
                  outlined
                  dense
                  hide-details
                />
              </div>
            </v-form>
          </div>

          <!-- Actions -->
          <div class="d-flex justify-end my-2">
            <v-btn text class="mr-2" @click="openUpadateLocationDialog = false"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              :disabled="!formValid"
              @click="updateLocation"
            >
              Update
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

export default {
  name: "locationList",
  data() {
    return {
      loading: false,
      locations: [],
      total: 0,
      page: 1,
      limit: 10,
      pageCount: 1,
      searchQuery: "",
      openAddLocationDialog: false,
      formValid: false,
      form: {
        name: "",
        address: "",
        pincode: "",
        contact_number: "",
        latitude: "",
        longitude: "",
      },

      openUpadateLocationDialog: false,
      editLocation: {
        location_id: null,
        name: "",
        address: "",
        pincode: "",
      },
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
  },

  methods: {
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

    async createlocation() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;

      try {
        const response = await api.post("/api/location", this.form);

        this.openAddLocationDialog = false;
        this.$refs.form.reset();
        this.fetchLocations();

        this.$swal.fire({
          icon: "success",
          title: "location Created",
          text: response.data?.message || "Location Added successfully!",
          confirmButtonColor: "#1976d2",
        });
      } catch (err) {
        console.error("Add error:", err);

        this.$swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "Something went wrong!",
          confirmButtonColor: "#d33",
        });
      } finally {
        this.loading = false;
      }
    },

    openEditDialog(location) {
      this.editLocation = { ...location };
      this.openUpadateLocationDialog = true;
    },

    async updateLocation() {
      if (!this.$refs.editForm.validate()) return;

      this.loading = true;
      try {
        const { location_id, name, address, pincode } = this.editLocation;
        await api.put(`/api/location/${location_id}`, {
          name,
          address,
          pincode,
        });

        this.openUpadateLocationDialog = false;
        this.fetchLocations();

        this.$swal.fire({
          icon: "success",
          title: "Location Updated",
          text: "Location updated successfully!",
          confirmButtonColor: "#1976d2",
        });
      } catch (err) {
        console.error("Update error:", err);
        this.$swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "Failed to update location.",
          confirmButtonColor: "#d33",
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped></style>
