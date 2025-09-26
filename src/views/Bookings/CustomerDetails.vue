<template>
  <deep-layout>
    <v-container class="py-8" fluid>
      <v-row>
        <!-- Left Column - Form -->
        <v-col cols="12" md="8">
          <!-- Customer Form -->
          <v-card elevation="2">
            <v-card-title class="grey white--text">
              <v-icon left color="white">mdi-account-edit</v-icon>
              Customer Information
            </v-card-title>
            <v-card-text class="pa-6">
              <v-form ref="form" v-model="formValid" lazy-validation>
                <!-- Existing Customer Selection -->
                <div class="mb-6">
                  <v-subheader class="px-0 text-subtitle-1 font-weight-bold">
                    <v-icon left>mdi-account-search</v-icon>
                    Select Existing Customer (Optional)
                  </v-subheader>
                  <SelectCustomer
                    v-model="selectedCustomer"
                    @input="populateCustomer"
                  />
                </div>

                <v-divider class="my-6"></v-divider>

                <!-- Personal Details -->
                <v-subheader class="px-0 text-subtitle-1 font-weight-bold mb-4">
                  <v-icon left>mdi-account</v-icon>
                  Personal Details
                </v-subheader>

                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.name"
                      label="Full Name"
                      outlined
                      dense
                      :rules="[rules.required]"
                      prepend-inner-icon="mdi-account"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.phone"
                      label="Phone Number"
                      outlined
                      dense
                      :rules="[rules.required, rules.phone]"
                      prepend-inner-icon="mdi-phone"
                    />
                  </v-col>
                </v-row>

                <v-text-field
                  v-model="form.email"
                  label="Email Address"
                  outlined
                  dense
                  :rules="[rules.required, rules.email]"
                  prepend-inner-icon="mdi-email"
                  class="mb-4"
                />

                <v-textarea
                  v-model="form.address"
                  label="Complete Address"
                  outlined
                  dense
                  rows="3"
                  prepend-inner-icon="mdi-map-marker"
                  class="mb-6"
                />
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column - Summary & Actions -->
        <v-col cols="12" md="4">
          <v-card outlined class="pa-4 rounded-lg sticky-card">
            <v-img
              :src="model?.image_url"
              height="200"
              class="rounded-lg mb-3"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.3)"
              contain
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="primary" />
                </v-row>
              </template>
            </v-img>

            <!-- Model Info -->
            <!-- <div class="overline text--secondary mb-1">
                {{ model?.make?.toUpperCase() }}
              </div> -->
            <div class="subtitle-1 font-weight-bold mb-2">
              {{ model?.model_name }}
            </div>

            <!-- Chips -->
            <div class="mb-3">
              <v-chip small class="mr-2 mb-1" color="success" outlined>
                <v-icon small left>mdi-leaf</v-icon>
                {{ model?.vehicle_type }}
              </v-chip>
              <v-chip small class="mr-2 mb-1" outlined>
                <v-icon small left>mdi-account-multiple</v-icon>
                {{ model?.seat_capacity }} Seats
              </v-chip>
              <v-chip small class="mb-1" outlined>
                <v-icon small left>mdi-speedometer</v-icon>
                {{ model?.range_km }} km Range
              </v-chip>
            </div>

            <!-- Description -->
            <p class="body-2 text--secondary">
              {{ model?.description?.substring(0, 120) }}...
            </p>

            <v-divider class="my-4"></v-divider>
            <div class="subtitle-1 font-weight-bold">Payment Summary</div>
            <v-card-text>
              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-subtitle-2">Subscription Plan</span>
                <span class="font-weight-bold">{{ subscription }}</span>
              </div>
              <div
                v-if="addons.length > 0"
                class="d-flex justify-space-between align-center mb-3"
              >
                <span class="text-subtitle-2"
                  >Add-ons ({{ addons.length }})
                  <v-chip
                    v-for="(addon, i) in addons"
                    :key="i"
                    class="ma-1"
                    color="primary"
                    outlined
                    small
                  >
                    <v-icon left small>mdi-check</v-icon>
                    {{ addon }}
                  </v-chip></span
                >
                <span class="font-weight-bold">Included</span>
              </div>
              <v-divider class="my-4"></v-divider>
              <div class="d-flex justify-space-between align-center mb-4">
                <span class="text-h6 font-weight-bold">Total Amount</span>
                <span class="text-h5 success--text font-weight-bold"
                  >₹{{ total }}</span
                >
              </div>

              <v-btn
                color="primary"
                large
                block
                rounded
                :disabled="!formValid"
                :loading="submitting"
                @click="submitForm"
                class="py-6"
              >
                Proceed to Payment
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </deep-layout>
</template>

<script>
import SelectCustomer from "@/components/SelectCustomer.vue";
import DeepLayout from "@/Layouts/DeepLayout.vue";
import api from "@/plugins/axios";

export default {
  name: "CustomerDetailsPage",
  components: { SelectCustomer, DeepLayout },
  data() {
    return {
      model: null,
      loading: false,
      selectedCustomer: null,
      form: {
        name: "",
        email: "",
        phone: "",
        address: "",
        dl_number: "",
        dl_file: null,
      },
      formValid: false,

      verifying: false,
      submitting: false,
      rules: {
        required: (v) => !!v || "This field is required",
        email: (v) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email",
        phone: (v) =>
          /^[6-9]\d{9}$/.test(v) || "Enter a valid 10-digit phone number",
      },
      total: null,
      subscription: null,
      addons: [],
      model_id: null, // Added model_id to component data
    };
  },
  async created() {
    this.model_id = this.$route.query.modelId || null;
    this.total = this.$route.query.total || 0;
    this.subscription = this.$route.query.subscription || "N/A";
    this.addons = this.$route.query.addons
      ? JSON.parse(this.$route.query.addons)
      : [];

    // Load model data if model_id is available
    if (this.model_id) {
      await this.loadModel(this.model_id);
    }
  },
  methods: {
    async loadModel(modelId) {
      this.loading = true;
      try {
        const { data } = await api.get(`/api/vehicle-model/${modelId}`);
        this.model = data.data;
      } catch (err) {
        console.error("Error loading model:", err);
        this.$swal.fire("Error", "Failed to load vehicle details", "error");
      } finally {
        this.loading = false;
      }
    },
    populateCustomer(customer) {
      if (customer) {
        this.form.name = customer.display_name || customer.name;
        this.form.email = customer.email || "";
        this.form.phone = customer.user_data?.phone || "";
        this.form.address = customer.address || "";
      }
    },

    async submitForm() {
      const isValid = await this.$refs.form.validate();
      if (!isValid) return;

      this.submitting = true;
      try {
        const payload = {
          ...this.form,
          model_id: this.model_id,
          subscription: this.subscription,
          addons: this.addons,
          total: this.total,
        };
        console.log("Submitting booking:", payload);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        this.$swal.fire({
          title: "Booking Confirmed!",
          text: "Redirecting to payment...",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        // Redirect to payment page
        setTimeout(() => {
          this.$router.push({
            path: "/payment",
            query: { ...this.$route.query, bookingId: "BK" + Date.now() },
          });
        }, 2000);
      } catch (err) {
        this.$swal.fire("Error", "Failed to submit booking", "error");
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.sticky-card {
  position: sticky;
  top: 20px;
}

.gap-2 > * {
  margin: 2px;
}
</style>
