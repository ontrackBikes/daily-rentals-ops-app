<template>
  <v-container>
    <div>
      <!-- Header: Title + Search + Add -->
      <v-row class="align-center">
        <v-col cols="12" md="6">
          <div class="text-h6 font-weight-bold">Addons ({{ total }})</div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="d-flex justify-end align-center">
            <v-text-field
              v-model="searchQuery"
              append-icon="mdi-magnify"
              placeholder="Search by addon name or type."
              dense
              hide-details
              outlined
              @input="onSearchInput"
              @keyup.enter="fetchAddons"
              class="rounded-lg mr-2"
            />
            <v-btn
              depressed
              rounded
              color="primary"
              dark
              @click="openAddDialog"
            >
              <v-icon left>mdi-plus</v-icon> Add addon
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Addons Table -->
      <v-card class="rounded-lg my-4" outlined :loading="loading">
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">Addon Name</th>
              <th class="text-left">Type</th>
              <th class="text-left">Base Price/Day</th>
              <th class="text-left">Offer Price/Day</th>
              <th class="text-left">Base Price/Booking</th>
              <th class="text-left">Offer Price/Booking</th>
              <th class="text-left">Quantity</th>
              <th class="text-left">Status</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="addon in addons" :key="addon.addon_id">
              <td>{{ addon.provider_addon_id }}</td>
              <td>{{ addon.addon_name }}</td>
              <td>{{ addon.addon_type }}</td>
              <td>{{ addon.base_price_per_day }}</td>
              <td>{{ addon.offer_price_per_day || "-" }}</td>
              <td>{{ addon.base_price_per_booking }}</td>
              <td>{{ addon.offer_price_per_booking || "-" }}</td>
              <td>{{ addon.total_quantity }}</td>
              <td>
                <v-chip
                  outlined
                  small
                  :class="addon.available ? 'success--text' : 'error--text'"
                >
                  {{ addon.available ? "Available" : "Not Available" }}
                </v-chip>
              </td>

              <td>
                <v-btn
                  small
                  icon
                  color="primary"
                  rounded
                  @click="openEditDialog(addon)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </td>
            </tr>
            <tr v-if="!addons.length">
              <td colspan="10" class="text-center grey--text">
                No addons found.
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
            @input="fetchAddons"
          />
        </v-card-actions>
      </v-card>
    </div>

    <!-- Add / Update Addon Dialog -->
    <v-dialog v-model="openAddonDialog" max-width="700px">
      <v-card :loading="loading">
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">
              {{ isEditMode ? "Update Addon" : "Add Addon" }}
            </div>
            <v-btn icon @click="closeDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Form -->
          <v-form ref="form" v-model="formValid" class="my-4">
            <!-- Addon Name -->
            <label class="text-subtitle-2">
              Addon Name <span class="red--text">*</span>
            </label>
            <div class="mb-3">
              <v-text-field
                v-model="form.addon_name"
                :rules="[rules.required]"
                required
                outlined
                dense
                hide-details
              />
            </div>

            <!-- Description -->
            <label class="text-subtitle-2">Description</label>
            <div class="mb-3">
              <v-textarea
                v-model="form.description"
                outlined
                dense
                rows="2"
                hide-details
              />
            </div>

            <!-- Base Price / Day -->
            <label class="text-subtitle-2">
              Base Price / Day <span class="red--text">*</span>
            </label>
            <div class="mb-3">
              <v-text-field
                v-model.number="form.base_price_per_day"
                type="number"
                :rules="[rules.required, rules.positive]"
                required
                outlined
                dense
                hide-details
              />
            </div>

            <!-- Offer Price / Day -->
            <label class="text-subtitle-2">Offer Price / Day</label>
            <div class="mb-3">
              <v-text-field
                v-model.number="form.offer_price_per_day"
                type="number"
                outlined
                dense
                hide-details
              />
            </div>

            <!-- Base Price / Booking -->
            <label class="text-subtitle-2">
              Base Price / Booking <span class="red--text">*</span>
            </label>
            <div class="mb-3">
              <v-text-field
                v-model.number="form.base_price_per_booking"
                type="number"
                :rules="[rules.required, rules.positive]"
                required
                outlined
                dense
                hide-details
              />
            </div>

            <!-- Offer Price / Booking -->
            <label class="text-subtitle-2">Offer Price / Booking</label>
            <div class="mb-3">
              <v-text-field
                v-model.number="form.offer_price_per_booking"
                type="number"
                outlined
                dense
                hide-details
              />
            </div>

            <!-- Total Quantity -->
            <label class="text-subtitle-2">
              Total Quantity <span class="red--text">*</span>
            </label>
            <div class="mb-3">
              <v-text-field
                v-model.number="form.total_quantity"
                type="number"
                :rules="[rules.required, rules.positive]"
                required
                outlined
                dense
                hide-details
              />
            </div>

            <!-- Addon Type -->
            <label class="text-subtitle-2">
              Addon Type <span class="red--text">*</span>
            </label>
            <div class="mb-3">
              <v-select
                v-model="form.addon_type"
                :items="addonTypes"
                :rules="[rules.required]"
                required
                outlined
                dense
                hide-details
              />
            </div>

            <!-- Availability -->
            <div class="mt-2">
              <v-switch
                v-model="form.available"
                label="Available"
                color="success"
              />
            </div>
          </v-form>

          <!-- Actions -->
          <div class="d-flex justify-end my-2">
            <v-btn text rounded depressed class="mr-2" @click="closeDialog">
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              :disabled="!formValid"
              rounded
              depressed
              @click="isEditMode ? updateAddon() : createAddon()"
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

export default {
  name: "AddonList",
  data() {
    return {
      loading: false,
      addons: [],
      total: 0,
      page: 1,
      limit: 10,
      pageCount: 1,
      searchQuery: "",
      openAddonDialog: false,
      isEditMode: false,
      formValid: false,
      form: {
        provider_addon_id: null,
        addon_name: "",
        description: "",
        base_price_per_day: 0,
        offer_price_per_day: null,
        base_price_per_booking: 0,
        offer_price_per_booking: null,
        total_quantity: 1,
        available: true,
        addon_type: "per_booking",
      },
      addonTypes: ["per_booking", "per_day"],
      rules: {
        required: (v) => !!v || "Required.",
        positive: (v) => v > 0 || "Must be greater than 0",
      },
    };
  },
  watch: {
    searchQuery: {
      handler: "onSearchInput",
    },
  },
  created() {
    this.onSearchInput = debounce(this.fetchAddons, 400);
  },
  mounted() {
    this.fetchAddons();
  },
  methods: {
    async fetchAddons() {
      this.loading = true;
      const offset = (this.page - 1) * this.limit;
      try {
        const { data } = await api.get("/api/addons", {
          params: {
            limit: this.limit,
            offset,
            search: this.searchQuery || undefined,
          },
        });
        this.addons = data?.data?.addons || [];
        this.total = data?.data?.meta?.total || 0;
        this.pageCount = Math.ceil(this.total / this.limit) || 1;
      } catch (err) {
        console.error("Fetch error:", err);
        this.$swal.fire("Error", "Failed to fetch addons", "error");
      } finally {
        this.loading = false;
      }
    },
    openAddDialog() {
      this.resetForm();
      this.isEditMode = false;
      this.openAddonDialog = true;
    },
    openEditDialog(addon) {
      this.form = { ...addon };
      this.isEditMode = true;
      this.openAddonDialog = true;
    },
    closeDialog() {
      this.openAddonDialog = false;
      this.resetForm();
    },
    resetForm() {
      this.form = {
        provider_addon_id: null,
        addon_name: "",
        description: "",
        base_price_per_day: 0,
        offer_price_per_day: null,
        base_price_per_booking: 0,
        offer_price_per_booking: null,
        total_quantity: 1,
        available: true,
        addon_type: "per_booking",
      };
      this.formValid = false;
    },
    async createAddon() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      try {
        await api.post("/api/addon", this.form);
        this.closeDialog();
        this.fetchAddons();
        this.$swal.fire("Success", "Addon created successfully!", "success");
      } catch (err) {
        this.$swal.fire(
          "Error",
          err.response?.data?.message || "Failed to create addon",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },
    async updateAddon() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      try {
        // Use providerAddonId instead of addon_id
        await api.put(`/api/addon/${this.form.provider_addon_id}`, {
          addon_name: this.form.addon_name,
          description: this.form.description,
          base_price_per_day: this.form.base_price_per_day,
          offer_price_per_day: this.form.offer_price_per_day,
          base_price_per_booking: this.form.base_price_per_booking,
          offer_price_per_booking: this.form.offer_price_per_booking,
          total_quantity: this.form.total_quantity,
          quantity_left: this.form.quantity_left || null,
          available: this.form.available,
          addon_type: this.form.addon_type,
        });
        this.closeDialog();
        this.fetchAddons();
        this.$swal.fire("Success", "Addon updated successfully!", "success");
      } catch (err) {
        this.$swal.fire(
          "Error",
          err.response?.data?.message || "Failed to update addon.",
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
