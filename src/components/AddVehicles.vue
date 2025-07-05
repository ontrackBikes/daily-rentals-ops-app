<template>
  <v-container class="py-4" fluid>
    <v-form
      @submit.prevent="submitVehicle"
      ref="form"
      lazy-validation
      v-model="valid"
    >
      <v-row dense>
        <!-- Model -->
        <v-col cols="12" md="6">
          <v-select
            v-model="vehicle.model_id"
            :items="models"
            item-text="model_name"
            item-value="model_id"
            label="Model *"
            :rules="[(v) => !!v || 'Model is required']"
            dense
            outlined
            required
          ></v-select>
        </v-col>

        <!-- Registration Number -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="vehicle.registration_number"
            label="Registration Number *"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          ></v-text-field>
        </v-col>

        <!-- Chassis Number -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="vehicle.chassis_number"
            label="Chassis Number *"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          ></v-text-field>
        </v-col>

        <!-- Engine Number -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="vehicle.engine_number"
            label="Engine Number *"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          ></v-text-field>
        </v-col>

        <!-- Vehicle Type -->
        <v-col cols="12" md="6">
          <v-select
            v-model="vehicle.vehicle_type"
            :items="['Bike', 'Scooter']"
            label="Vehicle Type *"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          ></v-select>
        </v-col>

        <!-- Color -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="vehicle.color"
            label="Color"
            dense
            outlined
          ></v-text-field>
        </v-col>

        <!-- Current KM -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="vehicle.current_km"
            label="Current KM"
            type="number"
            dense
            outlined
          ></v-text-field>
        </v-col>

        <!-- Next Service KM -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="vehicle.next_service_km"
            label="Next Service KM"
            type="number"
            dense
            outlined
          ></v-text-field>
        </v-col>

        <!-- Next Service Date -->
        <v-col cols="12" md="6">
          <v-menu
            ref="menu"
            v-model="dateMenu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="vehicle.next_service_date"
                label="Next Service Date"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
                dense
                outlined
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="vehicle.next_service_date"
              no-title
              scrollable
              @input="dateMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>

        <!-- Status -->
        <v-col cols="12" md="6">
          <v-select
            v-model="vehicle.status"
            :items="['available', 'rented', 'maintenance', 'hidden']"
            label="Status *"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          ></v-select>
        </v-col>

        <!-- Location -->
        <v-col cols="12" md="6">
          <v-select
            v-model="vehicle.location_id"
            :items="locations"
            item-text="name"
            item-value="location_id"
            label="Location *"
            :rules="[(v) => !!v || 'Required']"
            dense
            outlined
            required
          ></v-select>
        </v-col>

        <!-- Image URL -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="vehicle.image_url"
            label="Image URL (Optional)"
            dense
            outlined
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Submit Button -->
      <v-row justify="end">
        <v-col cols="auto">
          <v-btn
            :loading="loading"
            color="success"
            class="px-6"
            type="submit"
            :disabled="!valid"
          >
            Submit
          </v-btn>
        </v-col>
      </v-row>

      <!-- Error Alert -->
      <v-alert v-if="errorMessage" type="error" class="mt-4" dense dismissible>
        {{ errorMessage }}
      </v-alert>
    </v-form>
  </v-container>
</template>

<script>
import HTTP from "@/plugins/axios";
import Swal from "sweetalert2";

export default {
  name: "AddVehicle",
  data() {
    return {
      valid: false, // Tracks v-form validity
      vehicle: {
        model_id: "",
        registration_number: "",
        chassis_number: "",
        engine_number: "",
        vehicle_type: "",
        location_id: "",
        color: "",
        current_km: "",
        next_service_km: "",
        next_service_date: "",
        status: "available",
        image_url: "",
      },
      models: [],
      locations: [],
      errorMessage: "",
      loading: false,
      vehicle_id: "",
      dateMenu: false,
    };
  },
  created() {
    this.getVehicleModels();
    this.getProviderLocations();
  },
  methods: {
    async submitVehicle() {
      const isValid = this.$refs.form.validate();
      if (!isValid) return;

      this.errorMessage = "";
      this.loading = true;
      try {
        const res = await HTTP.post("/api/vehicle", {
          model_id: Number(this.vehicle.model_id),
          location_id: Number(this.vehicle.location_id),
          registration_number: this.vehicle.registration_number,
          chassis_number: this.vehicle.chassis_number,
          engine_number: this.vehicle.engine_number,
          current_km: Number(this.vehicle.current_km) || 0,
          next_service_km: Number(this.vehicle.next_service_km) || 0,
          next_service_date: this.vehicle.next_service_date || null,
          status: this.vehicle.status,
          image_url: this.vehicle.image_url || "",
          vehicle_type: this.vehicle.vehicle_type,
          color: this.vehicle.color || "",
        });

        this.vehicle_id = res.data.data.vehicle_id;
        this.resetForm();
        this.$emit("vehicle-added");
        this.$emit("close-dialog");

        Swal.fire({
          icon: "success",
          title: "Success",
          text: res.data.message || "Vehicle added successfully!",
          confirmButtonColor: "#198754",
        });
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Failed to add vehicle.";
      } finally {
        this.loading = false;
      }
    },

    async getVehicleModels() {
      try {
        const { data } = await HTTP.get("/api/vehicle-models", {
          params: { limit: 20, offset: 0 },
        });
        this.models = data.data.models;
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    },

    async getProviderLocations() {
      try {
        const { data } = await HTTP.get("/api/locations", {
          params: { limit: 20, offset: 0 },
        });
        this.locations = data.data.locations;
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    },

    resetForm() {
      this.vehicle = {
        model_id: "",
        registration_number: "",
        chassis_number: "",
        engine_number: "",
        vehicle_type: "",
        location_id: "",
        color: "",
        current_km: "",
        next_service_km: "",
        next_service_date: "",
        status: "available",
        image_url: "",
      };
      this.$refs.form.resetValidation(); // Clear validation on reset
    },
  },
};
</script>
