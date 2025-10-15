<template>
  <v-container class="py-4" fluid>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      @submit.prevent="submitModel"
    >
      <v-row dense>
        <!-- Model Name -->
        <v-col cols="12" md="6">
          <label class="text-subtitle-2">
            Model Name <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-text-field
              v-model="model.model_name"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>

        <!-- Make -->
        <v-col cols="12" md="6">
          <label class="text-subtitle-2">
            Make <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-text-field
              v-model="model.make"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>

        <!-- Year -->
        <v-col cols="12" md="6">
          <label class="text-subtitle-2">
            Year <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-text-field
              v-model="model.year"
              type="number"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>

        <!-- Vehicle Type -->
        <v-col cols="12" md="6">
          <label class="text-subtitle-2">
            Vehicle Type <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-select
              v-model="model.vehicle_type"
              :items="['ICE', 'EV']"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>

        <!-- Seat Capacity -->
        <v-col cols="12" md="6">
          <label class="text-subtitle-2">
            Seat Capacity <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-text-field
              v-model="model.seat_capacity"
              type="number"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>

        <!-- Body Type -->
        <v-col cols="12" md="6">
          <label class="text-subtitle-2">
            Body Type <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-text-field
              v-model="model.body_type"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>

        <!-- Start Type -->
        <v-col cols="12" md="6">
          <label class="text-subtitle-2">
            Start Type <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-select
              v-model="model.start_type"
              :items="['self', 'kick']"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>

        <!-- Fuel Capacity (ICE) -->
        <v-col cols="12" md="6" v-if="model.vehicle_type === 'ICE'">
          <label class="text-subtitle-2">
            Fuel Capacity (L) <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-text-field
              v-model="model.fuel_capacity"
              type="number"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>

        <!-- Battery Capacity (EV) -->
        <v-col cols="12" md="6" v-if="model.vehicle_type === 'EV'">
          <label class="text-subtitle-2">
            Battery Capacity (kWh) <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-text-field
              v-model="model.battery_capacity"
              type="number"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>

        <!-- Range KM (EV) -->
        <v-col cols="12" md="6" v-if="model.vehicle_type === 'EV'">
          <label class="text-subtitle-2">
            Range (KM) <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-text-field
              v-model="model.range_km"
              type="number"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>
        <v-col cols="12" md="6" v-if="model.vehicle_type === 'EV'">
          <label class="text-subtitle-2">
            Moter Power <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-text-field
              v-model="model.motor_power"
              type="number"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>

        <!-- Base Rates -->
        <!-- <v-col cols="12" md="6">
          <label class="text-subtitle-2">
            Base Hourly Rate <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-text-field
              v-model="model.base_hourly_rate"
              type="number"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <label class="text-subtitle-2">
            Base Daily Rate <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-text-field
              v-model="model.base_daily_rate"
              type="number"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <label class="text-subtitle-2">
            Base Weekly Rate <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-text-field
              v-model="model.base_weekly_rate"
              type="number"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <label class="text-subtitle-2">
            Base Monthly Rate <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-text-field
              v-model="model.base_monthly_rate"
              type="number"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col> -->

        <!-- Description -->
        <v-col cols="12">
          <label class="text-subtitle-2">
            Description <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-textarea
              v-model="model.description"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              rows="3"
              required
              hide-details
            />
          </div>
        </v-col>
        <!-- Footer content -->
        <v-col cols="12">
          <label class="text-subtitle-2"> Footer Content </label>
          <div class="mb-3">
            <v-textarea
              v-model="model.footer_content"
              outlined
              dense
              rows="3"
              required
              hide-details
            />
          </div>
        </v-col>

        <!-- Image URL -->
        <v-col cols="12" md="6">
          <label class="text-subtitle-2">Image URL (Optional)</label>
          <div class="mb-3">
            <v-text-field
              v-model="model.image_url"
              outlined
              dense
              hide-details
            />
          </div>
        </v-col>

        <!-- Status -->
        <v-col cols="12" md="6">
          <label class="text-subtitle-2">
            Status <span class="red--text">*</span>
          </label>
          <div class="mb-3">
            <v-select
              v-model="model.status"
              :items="['active', 'inactive']"
              :rules="[(v) => !!v || 'Required']"
              outlined
              dense
              required
              hide-details
            />
          </div>
        </v-col>

        <!-- Submit Button -->
        <v-col cols="12" class="d-flex justify-end">
          <v-btn
            :loading="loading"
            color="primary"
            type="submit"
            :disabled="!valid"
            rounded
            depressed
          >
            {{ isEditMode ? "Update Model" : "Add Model" }}
          </v-btn>
        </v-col>

        <!-- Error Alert -->
        <v-col cols="12" v-if="errorMessage">
          <v-alert type="error" dense dismissible>
            {{ errorMessage }}
          </v-alert>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import HTTP from "@/plugins/axios";
import Swal from "sweetalert2";

export default {
  //   props: {
  //     modelId: { type: Number, default: null },
  //   },
  data() {
    return {
      valid: false,
      loading: false,
      errorMessage: "",
      model: {
        model_name: "",
        make: "",
        year: null,
        seat_capacity: null,
        body_type: "",
        vehicle_type: "",
        start_type: "",
        fuel_capacity: null,
        battery_capacity: null,
        range_km: null,
        motor_power: null,
        // moter_power: null,
        // base_hourly_rate: null,
        // base_daily_rate: null,
        // base_weekly_rate: null,
        // base_monthly_rate: null,
        description: "",
        footer_content: "",
        image_url: "",
        status: "active",
      },
    };
  },
  computed: {
    isEditMode() {
      return !!this.modelId;
    },
  },
  props: {
    modelId: { type: Number, default: null },
    editDialog: { type: Boolean, default: false },
  },
  watch: {
    modelId: {
      immediate: true,
      handler(newId) {
        if (newId) this.loadModel();
        else this.resetForm();
      },
    },
    editDialog(newVal) {
      if (newVal && this.modelId) this.loadModel();
    },
  },

  mounted() {
    if (this.isEditMode) this.loadModel();
  },
  methods: {
    async loadModel() {
      this.loading = true;
      try {
        const res = await HTTP.get(`/api/vehicle-model/${this.modelId}`);
        this.model = { ...res.data.data };
      } catch (err) {
        this.errorMessage =
          err.response?.data?.message || "Failed to load model data.";
      } finally {
        this.loading = false;
      }
    },
    async submitModel() {
      const isValid = this.$refs.form.validate();
      if (!isValid) return;

      this.errorMessage = "";
      this.loading = true;

      try {
        const payload = { ...this.model };

        if (payload.vehicle_type === "ICE") {
          delete payload.battery_capacity;
          delete payload.range_km;
          delete payload.moter_power;
        } else if (payload.vehicle_type === "EV") {
          delete payload.fuel_capacity;
        }

        let res;
        if (this.isEditMode) {
          res = await HTTP.put(`/api/vehicle-model/${this.modelId}`, payload);
        } else {
          res = await HTTP.post(`/api/vehicle-model`, payload);
        }

        Swal.fire({
          icon: "success",
          title: "Success",
          text:
            res.data.message ||
            (this.isEditMode
              ? "Model updated successfully!"
              : "Model added successfully!"),
          confirmButtonColor: "#198754",
        });

        this.resetForm();
        this.$emit("model-saved");
      } catch (err) {
        this.errorMessage =
          err.response?.data?.message || "Failed to save model.";
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.model = {
        model_name: "",
        make: "",
        year: null,
        seat_capacity: null,
        body_type: "",
        vehicle_type: "",
        start_type: "",
        fuel_capacity: null,
        battery_capacity: null,
        range_km: null,
        motor_power: null,
        // base_hourly_rate: null,
        // base_daily_rate: null,
        // base_weekly_rate: null,
        // base_monthly_rate: null,
        description: "",
        image_url: "",
        status: "active",
      };
      this.$refs.form.resetValidation();
    },
  },
};
</script>
