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
          <v-text-field
            v-model="model.model_name"
            label="Model Name *"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <!-- Make -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="model.make"
            label="Make *"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <!-- Year -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="model.year"
            label="Year *"
            type="number"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <!-- Vehicle Type -->
        <v-col cols="12" md="6">
          <v-select
            v-model="model.vehicle_type"
            :items="['ICE', 'EV']"
            label="Vehicle Type *"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <!-- Seat Capacity -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="model.seat_capacity"
            label="Seat Capacity *"
            type="number"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <!-- Body Type -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="model.body_type"
            label="Body Type *"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <!-- Start Type -->
        <v-col cols="12" md="6">
          <v-select
            v-model="model.start_type"
            :items="['self', 'kick']"
            label="Start Type *"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <!-- Fuel Capacity (ICE) -->
        <v-col cols="12" md="6" v-if="model.vehicle_type === 'ICE'">
          <v-text-field
            v-model="model.fuel_capacity"
            label="Fuel Capacity (L) *"
            type="number"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <!-- Battery Capacity (EV) -->
        <v-col cols="12" md="6" v-if="model.vehicle_type === 'EV'">
          <v-text-field
            v-model="model.battery_capacity"
            label="Battery Capacity (kWh) *"
            type="number"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <!-- Range KM (EV) -->
        <v-col cols="12" md="6" v-if="model.vehicle_type === 'EV'">
          <v-text-field
            v-model="model.range_km"
            label="Range (KM) *"
            type="number"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <!-- Rates -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="model.base_hourly_rate"
            label="Base Hourly Rate *"
            type="number"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="model.base_daily_rate"
            label="Base Daily Rate *"
            type="number"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="model.base_weekly_rate"
            label="Base Weekly Rate *"
            type="number"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="model.base_monthly_rate"
            label="Base Monthly Rate *"
            type="number"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <!-- Description -->
        <v-col cols="12">
          <v-textarea
            v-model="model.description"
            label="Description *"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            rows="3"
            required
          />
        </v-col>

        <!-- Image URL -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="model.image_url"
            label="Image URL (Optional)"
            dense
            outlined
          />
        </v-col>

        <!-- Status -->
        <v-col cols="12" md="6">
          <v-select
            v-model="model.status"
            :items="['active', 'inactive']"
            label="Status *"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          />
        </v-col>

        <!-- Submit Button -->
        <v-row justify="end">
          <v-col cols="auto">
            <v-btn
              :loading="loading"
              color="success"
              type="submit"
              :disabled="!valid"
              rounded
            >
              {{ isEditMode ? "Update Model" : "Add Model" }}
            </v-btn>
          </v-col>
        </v-row>

        <!-- Error Alert -->
        <v-alert
          v-if="errorMessage"
          type="error"
          class="mt-4"
          dense
          dismissible
        >
          {{ errorMessage }}
        </v-alert>
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
        base_hourly_rate: null,
        base_daily_rate: null,
        base_weekly_rate: null,
        base_monthly_rate: null,
        description: "",
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
        base_hourly_rate: null,
        base_daily_rate: null,
        base_weekly_rate: null,
        base_monthly_rate: null,
        description: "",
        image_url: "",
        status: "active",
      };
      this.$refs.form.resetValidation();
    },
  },
};
</script>
