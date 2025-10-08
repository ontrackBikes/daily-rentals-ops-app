<template>
  <deep-layout>
    <v-container fluid>
      <!-- Loading State -->
      <v-row v-if="loading" justify="center" class="my-12">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64" />
          <div class="mt-4 text-h6 grey--text">Loading model details...</div>
        </v-col>
      </v-row>

      <!-- Model Info -->
      <v-row v-else-if="model" dense>
        <!-- LEFT: Model Summary -->
        <v-col cols="12" md="3">
          <v-card outlined class="pa-4 rounded-lg">
            <!-- Status -->
            <div class="d-flex align-center justify-space-between">
              <v-chip
                small
                :color="statusColor"
                text-color="white"
                class="font-weight-medium"
              >
                {{ formatStatus(model.status) }}
              </v-chip>
            </div>

            <!-- Model Name -->
            <div class="text-h6 font-weight-bold mt-3">
              {{ model.make }} {{ model.model_name }}
              <span class="grey--text text--darken-1">({{ model.year }})</span>
            </div>

            <!-- Attributes -->
            <div class="mt-3">
              <div class="d-flex align-center mb-2">
                <v-icon small color="indigo" class="mr-2">mdi-shape</v-icon>
                <span class="text-body-2 grey--text text--darken-1">
                  {{ model.body_type }}
                </span>
              </div>

              <div class="d-flex align-center mb-2">
                <v-icon small color="indigo" class="mr-2">mdi-motorbike</v-icon>
                <span class="text-body-2 grey--text text--darken-1">
                  {{ model.vehicle_type }}
                </span>
              </div>

              <div class="d-flex align-center mb-2">
                <v-icon small color="indigo" class="mr-2">mdi-seat</v-icon>
                <span class="text-body-2 grey--text text--darken-1">
                  Seats: {{ model.seat_capacity }}
                </span>
              </div>

              <div class="d-flex align-center">
                <v-icon small color="indigo" class="mr-2">mdi-calendar</v-icon>
                <span class="text-body-2 grey--text text--darken-1">
                  Created: {{ formatDate(model.created_at) }}
                </span>
              </div>
            </div>

            <!-- Image -->
            <div class="text-center mt-5">
              <v-img
                v-if="model.image_url"
                :src="model.image_url"
                max-height="160"
                max-width="220"
                contain
                class="mx-auto rounded"
              />
              <v-icon v-else size="80" color="grey lighten-2">
                mdi-motorcycle
              </v-icon>
            </div>

            <!-- Edit Button -->
            <div class="text-center mt-4">
              <v-btn rounded color="primary" @click="editDialog = true"
                >Edit Model</v-btn
              >
            </div>
          </v-card>
        </v-col>

        <!-- RIGHT: Tabs -->
        <v-col cols="12" md="9">
          <v-card flat>
            <!-- Tabs -->
            <v-tabs
              v-model="activeTab"
              background-color="transparent"
              show-arrows
              slider-color="primary"
            >
              <v-tab>Overview</v-tab>
              <v-tab>Vehicles</v-tab>
            </v-tabs>

            <!-- Tabs Content -->
            <v-tabs-items v-model="activeTab">
              <!-- Overview -->
              <v-tab-item>
                <v-card flat class="pa-6 elevation-1">
                  <!-- Header Row with Optional Actions -->
                  <div class="d-flex justify-space-between align-center mb-4">
                    <!-- Uncomment for edit button if needed -->
                    <!-- <v-btn small color="primary" @click="openOverviewEditor">Edit</v-btn> -->
                  </div>

                  <!-- Specifications Section -->
                  <section class="mb-6">
                    <h3 class="font-weight-bold mb-3">Specifications</h3>
                    <v-row dense>
                      <v-col cols="12" sm="6" lg="4">
                        <strong>Body Type:</strong>
                        {{ model.body_type || "N/A" }}
                      </v-col>
                      <v-col cols="12" sm="6" lg="4">
                        <strong>Vehicle Type:</strong>
                        {{ model.vehicle_type || "N/A" }}
                      </v-col>
                      <v-col cols="12" sm="6" lg="4">
                        <strong>Start Type:</strong>
                        {{ model.start_type || "N/A" }}
                      </v-col>
                      <v-col cols="12" sm="6" lg="4" v-if="model.fuel_capacity">
                        <strong>Fuel Capacity:</strong>
                        {{ model.fuel_capacity }} L
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                        lg="4"
                        v-if="model.battery_capacity"
                      >
                        <strong>Battery Capacity:</strong>
                        {{ model.battery_capacity }} kWh
                      </v-col>
                      <v-col cols="12" sm="6" lg="4" v-if="model.range_km">
                        <strong>Range:</strong> {{ model.range_km }} km
                      </v-col>
                      <v-col cols="12" sm="6" lg="4">
                        <strong>Year:</strong> {{ model.year || "N/A" }}
                      </v-col>
                      <v-col cols="12" sm="6" lg="4">
                        <strong>Make:</strong> {{ model.make || "N/A" }}
                      </v-col>
                      <v-col cols="12" sm="6" lg="4">
                        <strong>Seat Capacity:</strong>
                        {{ model.seat_capacity || "N/A" }}
                      </v-col>
                    </v-row>
                  </section>

                  <section class="mb-6">
                    <h3 class="font-weight-bold mb-3">Pricing</h3>
                    <v-row
                      v-if="
                        model.vehicle_model_pricing_data &&
                        model.vehicle_model_pricing_data.length
                      "
                      class="gy-4"
                    >
                      <v-col
                        v-for="plan in model.vehicle_model_pricing_data"
                        :key="plan.pricing_id"
                        cols="12"
                        md="6"
                        lg="4"
                      >
                        <v-card outlined class="pa-4 rounded-xl elevation-0">
                          <div
                            class="d-flex align-center justify-space-between mb-2"
                          >
                            <span class="font-weight-bold">{{
                              plan.model_pricing_plan_data.plan_name
                            }}</span>
                            <v-chip small color="primary" outlined>
                              {{ plan.model_pricing_plan_data.plan_type }}
                            </v-chip>
                          </div>

                          <div class="my-2">
                            <span class="font-weight-bold">Price:</span>
                            <span
                              v-if="
                                plan.offer_rate &&
                                Number(plan.offer_rate) < Number(plan.base_rate)
                              "
                            >
                              <s class="grey--text"
                                >₹{{
                                  Number(plan.base_rate).toLocaleString()
                                }}</s
                              >
                              <span class="ml-2 red--text font-weight-bold"
                                >₹{{
                                  Number(plan.offer_rate).toLocaleString()
                                }}</span
                              >
                              <v-chip
                                x-small
                                color="green lighten-1"
                                dark
                                class="ml-2"
                                >Offer</v-chip
                              >
                            </span>
                            <span v-else>
                              <span class="primary--text font-weight-bold"
                                >₹{{
                                  Number(plan.base_rate).toLocaleString()
                                }}</span
                              >
                            </span>
                          </div>

                          <v-simple-table dense>
                            <tbody>
                              <tr>
                                <td>KM Cap</td>
                                <td>
                                  {{ plan.model_pricing_plan_data.km_cap }} km
                                </td>
                              </tr>
                              <tr>
                                <td>Extra KM</td>
                                <td>
                                  ₹{{
                                    plan.model_pricing_plan_data.extra_km_rate
                                  }}
                                </td>
                              </tr>
                              <tr>
                                <td>Deposit</td>
                                <td>
                                  ₹{{
                                    Number(
                                      plan.model_pricing_plan_data
                                        .security_deposit
                                    ).toLocaleString()
                                  }}
                                </td>
                              </tr>
                            </tbody>
                          </v-simple-table>
                          <!-- Optionally, show "More" for plan description (collapsed by default) -->
                          <div
                            v-if="plan.model_pricing_plan_data.plan_description"
                            class="mt-2 text-caption grey--text text--darken-1"
                          >
                            <span v-if="!plan.showDesc">
                              {{
                                plan.model_pricing_plan_data.plan_description
                              }}
                            </span>
                          </div>
                        </v-card>
                      </v-col>
                    </v-row>
                    <v-alert type="info" outlined v-else>
                      Pricing information is not available for this model.
                    </v-alert>
                  </section>

                  <!-- Description Section -->
                  <section>
                    <h3 class="font-weight-bold mb-3">Description</h3>
                    <p class="text-body-2 mb-0" v-if="model.description">
                      {{ model.description }}
                    </p>
                    <p
                      class="text-body-2 mb-0 grey--text text--darken-1"
                      v-else
                    >
                      No description provided for this vehicle model.
                    </p>
                  </section>
                </v-card>
              </v-tab-item>

              <!-- Vehicles -->
              <v-tab-item>
                <v-card flat class="pa-4">
                  <v-data-table
                    :headers="vehicleHeaders"
                    :items="model.vehicle_data"
                    item-key="vehicle_id"
                    dense
                    class="elevation-2 rounded-lg"
                    hide-default-footer
                  >
                    <!-- Color -->
                    <template v-slot:[`item.color`]="{ item }">
                      <div class="d-flex align-center">
                        <v-tooltip bottom v-if="item.color">
                          <template v-slot:activator="{ on, attrs }">
                            <span
                              v-bind="attrs"
                              v-on="on"
                              class="d-inline-block rounded-circle mr-2"
                              :style="{
                                backgroundColor: item.color,
                                width: '14px',
                                height: '14px',
                                border: '1px solid #ccc',
                              }"
                            ></span>
                          </template>
                          <span>{{ item.color }}</span>
                        </v-tooltip>
                        <span>{{ item.color || "-" }}</span>
                      </div>
                    </template>

                    <!-- Status -->
                    <template v-slot:[`item.status`]="{ item }">
                      <v-chip
                        small
                        dark
                        :color="getStatusColor(item.status, 'vehicle')"
                        class="text-capitalize font-weight-medium"
                      >
                        {{ item.status }}
                      </v-chip>
                    </template>

                    <!-- Location -->
                    <template v-slot:[`item.location`]="{ item }">
                      {{ item.location_data?.name || "-" }}
                    </template>

                    <!-- No Data State -->
                    <template v-slot:no-data>
                      <v-alert
                        type="info"
                        border="left"
                        color="blue lighten-5"
                        class="ma-4"
                        prominent
                      >
                        <div class="d-flex align-center">
                          <v-icon color="primary" class="mr-2"
                            >mdi-information</v-icon
                          >
                          <span>No vehicles available for this model.</span>
                        </div>
                      </v-alert>
                    </template>
                  </v-data-table>
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </v-col>
      </v-row>

      <!-- No Data -->
      <v-row v-else justify="center" class="my-12">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="120" color="grey lighten-2">mdi-motorcycle</v-icon>
          <div class="text-h5 mt-4 grey--text">No model data available</div>
        </v-col>
      </v-row>

      <!-- Edit Model Dialog -->
      <v-dialog v-model="editDialog" max-width="800px">
        <v-card :loading="loading">
          <v-container>
            <!-- Header -->
            <div class="d-flex justify-space-between align-center">
              <div class="text-h6 font-weight-bold">Edit Model</div>
              <v-btn icon @click="editDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>

            <!-- Form Content -->
            <div class="my-4">
              <AddModel
                :modelId="model.model_id"
                @model-saved="reloadModel"
                :editDialog.sync="editDialog"
              />
            </div>
          </v-container>
        </v-card>
      </v-dialog>

      <!-- Edit Pricing & Description Dialog -->
      <v-dialog v-model="editOverviewDialog" max-width="600">
        <v-card>
          <v-card-title>Edit Pricing & Description</v-card-title>
          <v-card-text>
            <v-form ref="overviewForm" v-model="overviewValid" lazy-validation>
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="overviewModel.base_hourly_rate"
                    label="Hourly Rate *"
                    type="number"
                    :rules="[(v) => !!v || 'Required']"
                    dense
                    outlined
                    required
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="overviewModel.base_daily_rate"
                    label="Daily Rate *"
                    type="number"
                    :rules="[(v) => !!v || 'Required']"
                    dense
                    outlined
                    required
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="overviewModel.base_weekly_rate"
                    label="Weekly Rate *"
                    type="number"
                    :rules="[(v) => !!v || 'Required']"
                    dense
                    outlined
                    required
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="overviewModel.base_monthly_rate"
                    label="Monthly Rate *"
                    type="number"
                    :rules="[(v) => !!v || 'Required']"
                    dense
                    outlined
                    required
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="overviewModel.description"
                    label="Description *"
                    :rules="[(v) => !!v || 'Required']"
                    outlined
                    dense
                    rows="4"
                    required
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              text
              rounded
              color="primary"
              @click="editOverviewDialog = false"
              >Cancel</v-btn
            >
            <v-btn
              color="success"
              @click="submitOverview"
              :loading="overviewLoading"
              :disabled="!overviewValid"
              rounded
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </deep-layout>
</template>

<script>
import HTTP from "@/plugins/axios";
import DeepLayout from "@/Layouts/DeepLayout.vue";
import AddModel from "@/components/AddModel.vue";
import StatusService from "@/plugins/statusColor";
import Swal from "sweetalert2";

export default {
  name: "ModelView",
  components: { DeepLayout, AddModel },
  data() {
    return {
      model_id: this.$route.params.model_id,
      model: null,
      loading: false,
      activeTab: 0,
      editDialog: false,
      editOverviewDialog: false,
      overviewModel: {},
      overviewValid: false,
      overviewLoading: false,
      vehicleHeaders: [
        { text: "Reg. Number", value: "registration_number" },
        { text: "Color", value: "color" },
        { text: "Status", value: "status" },
        // { text: "Type", value: "vehicle_type" },
        { text: "Location", value: "location" },
        { text: "Current KM", value: "current_km" },
        { text: "Next Service", value: "next_service_km" },
      ],
    };
  },
  mounted() {
    this.loadModel();
  },
  computed: {
    statusColor() {
      switch (this.model?.status) {
        case "active":
          return "success";
        case "inactive":
          return "grey";
        default:
          return "blue-grey";
      }
    },
  },
  methods: {
    async loadModel() {
      this.loading = true;
      try {
        const { data } = await HTTP.get(`/api/vehicle-model/${this.model_id}`);
        this.model = data.data;
      } catch (err) {
        console.error("Error loading model:", err);
        Swal.fire("Error", "Failed to load model details", "error");
      } finally {
        this.loading = false;
      }
    },
    reloadModel() {
      this.editDialog = false;
      this.loadModel();
    },
    openOverviewEditor() {
      this.overviewModel = {
        base_hourly_rate: this.model.base_hourly_rate,
        base_daily_rate: this.model.base_daily_rate,
        base_weekly_rate: this.model.base_weekly_rate,
        base_monthly_rate: this.model.base_monthly_rate,
        description: this.model.description,
      };
      this.editOverviewDialog = true;
    },
    async submitOverview() {
      const isValid = this.$refs.overviewForm.validate();
      if (!isValid) return;

      this.overviewLoading = true;
      try {
        await HTTP.put(
          `/api/vehicle-model/${this.model.model_id}`,
          this.overviewModel
        );
        this.editOverviewDialog = false;
        this.loadModel();
        Swal.fire("Success", "Overview updated successfully!", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to update overview.", "error");
      } finally {
        this.overviewLoading = false;
      }
    },
    formatStatus(status) {
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : "";
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString("en-GB");
    },
    getStatusColor(status, type) {
      return StatusService.getColor(status, type);
    },
  },
};
</script>
