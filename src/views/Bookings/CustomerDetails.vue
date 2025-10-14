<template>
  <deep-layout>
    <v-container class="py-8">
      <v-row>
        <!-- Left Column - Form -->
        <v-col cols="12" md="8">
          <v-card outlined class="rounded-lg">
            <v-card-title class="grey white--text">
              <v-icon left color="white">mdi-account-edit</v-icon>
              Customer Information
            </v-card-title>
            <v-card-text class="pa-6">
              <v-form ref="form" v-model="formValid" lazy-validation>
                <!-- Existing Customer -->
                <div class="mb-6">
                  <v-subheader class="px-0 text-subtitle-1 font-weight-bold">
                    <v-icon left>mdi-account-search</v-icon>
                    Select Existing Customer (Required)
                  </v-subheader>
                  <SelectCustomer
                    v-model="selectedCustomer"
                    @input="populateCustomer"
                  />
                  <div
                    v-if="!selectedCustomer && triedToSubmit"
                    class="red--text text-caption mt-2"
                  >
                    Please select or create a customer before booking.
                  </div>
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
                      :disabled="true"
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
                      :disabled="true"
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

                <v-select
                  v-if="type === 'delivery'"
                  v-model="selectedAddressId"
                  :items="addressList"
                  item-text="address_line"
                  item-value="address_id"
                  label="Select Saved Address"
                  outlined
                  dense
                  prepend-inner-icon="mdi-map-marker"
                  class="mb-4"
                  :rules="[(v) => !!v || 'Please select an address']"
                  @change="setSelectedAddress"
                >
                  <template v-slot:item="{ item, on, attrs }">
                    <v-list-item v-bind="attrs" v-on="on">
                      <v-list-item-content>
                        <v-list-item-title>{{
                          item.address_line
                        }}</v-list-item-title>
                        <v-list-item-subtitle>{{
                          item.postal_code
                        }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </template>

                  <template v-slot:selection="{ item }">
                    <span
                      >{{ item.address_line }} - {{ item.postal_code }}</span
                    >
                  </template>
                </v-select>

                <v-textarea
                  v-else
                  v-model="form.address"
                  label="Complete Address"
                  outlined
                  dense
                  rows="3"
                  :disabled="true"
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

            <div class="subtitle-1 font-weight-bold mb-2">
              {{ model?.model_name || "Vehicle model" }}
            </div>

            <div class="mb-3">
              <v-chip small class="mr-2 mb-1" color="success" outlined>
                <v-icon small left>mdi-leaf</v-icon>
                {{ model?.vehicle_type || "—" }}
              </v-chip>
              <v-chip small class="mr-2 mb-1" outlined>
                <v-icon small left>mdi-account-multiple</v-icon>
                {{ model?.seat_capacity || "—" }} Seats
              </v-chip>
              <v-chip small class="mb-1" outlined>
                <v-icon small left>mdi-speedometer</v-icon>
                {{ model?.range_km || "—" }} km Range
              </v-chip>
            </div>

            <p class="body-2 text--secondary">
              {{ (model?.description || "").substring(0, 120) }}...
            </p>

            <v-divider class="my-4"></v-divider>
            <div class="subtitle-1 font-weight-bold">Payment Summary</div>

            <div>
              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-subtitle-2">Subscription Plan</span>
                <span class="font-weight-bold">{{ subscription }}</span>
              </div>

              <div
                v-if="addons && addons.length > 0"
                class="d-flex justify-space-between align-center mb-3"
              >
                <span class="text-subtitle-2">Add-ons</span>
                <div class="mt-2">
                  <v-chip
                    v-for="(addon, i) in addons"
                    :key="i"
                    class="ma-1"
                    outlined
                    small
                  >
                    <v-icon left small>mdi-check</v-icon>
                    {{ addon.name || addon.title || addon }}
                  </v-chip>
                </div>
              </div>

              <v-divider class="my-4"></v-divider>

              <div class="d-flex justify-space-between align-center mb-4">
                <span class="text-h6 font-weight-bold">Total Amount</span>
                <span class="text-h5 success--text font-weight-bold">
                  ₹{{ formatAmount(total) }}
                </span>
              </div>

              <v-btn
                color="primary"
                depressed
                block
                large
                rounded
                :disabled="!formValid || previewLoading"
                :loading="previewLoading"
                @click="previewBooking"
              >
                Preview & Confirm
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-overlay :value="globalLoading" absolute>
      <v-progress-circular indeterminate size="64" />
    </v-overlay>

    <CreateBookingDialog
      :open="previewDialog"
      @update:open="previewDialog = $event"
      :customer-id="selectedCustomer?.customer_id"
      :pricing-id="pricing_id"
      :addons="addons"
      :vehicle-id="vehicle_id"
      :location-id="location_id"
      :delivery-details="{ type, address_id: selectedAddressId, pincode }"
      :is-confirm-mode="isConfirmMode"
      @confirm-preview="handlePreviewConfirm"
    />
  </deep-layout>
</template>

<script>
import SelectCustomer from "@/components/SelectCustomer.vue";
import DeepLayout from "@/Layouts/DeepLayout.vue";
import api from "@/plugins/axios";
import CreateBookingDialog from "@/components/CreateBookingDialog.vue";

export default {
  name: "CustomerDetailsPage",
  components: { SelectCustomer, DeepLayout, CreateBookingDialog },
  data() {
    return {
      model: null,
      loading: false,
      globalLoading: false,
      selectedCustomer: null,
      form: { name: "", email: "", phone: "", address: "" },
      formValid: false,
      triedToSubmit: false,
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
      model_id: null,
      pricing_id: null,
      vehicle_id: null,
      type: "pickup",
      pincode: null,
      location_id: null,
      previewDialog: false,
      isConfirmMode: false,
      addressList: [],
      selectedAddressId: null,
    };
  },
  async created() {
    this.model_id = this.$route.query.modelId || null;
    this.total = parseFloat(this.$route.query.total || 0);
    this.pricing_id = this.$route.query.pricingId || null;
    this.vehicle_id = this.$route.query.vehicleId || null;
    this.subscription = this.$route.query.subscription || "N/A";
    this.type = this.$route.query.type || "pickup";
    this.pincode = this.$route.query.pincode || null;
    this.location_id = this.$route.query.locationId || null;

    try {
      this.addons = this.$route.query.addons
        ? JSON.parse(this.$route.query.addons)
        : [];
    } catch (e) {
      this.addons = this.$route.query.addons || [];
    }

    if (this.model_id) await this.loadModel(this.model_id);
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
      this.selectedCustomer = customer;
      if (customer) {
        this.form.name =
          customer.display_name || customer.name || this.form.name;
        const emailContact = customer.customer_contact_data?.find(
          (c) => c.type === "email" && c.is_primary
        );
        this.form.email = emailContact?.value || "";
        this.form.phone = customer.user_data?.phone || this.form.phone || "";
        this.form.address = customer.address || this.form.address || "";
        if (this.type === "delivery")
          this.fetchCustomerAddresses(customer.customer_id);
      }
    },
    formatAmount(v) {
      if (v === null || v === undefined) return "0";
      const num = Number(v);
      return Number.isNaN(num) ? v : num.toLocaleString("en-IN");
    },
    buildAddonsPayload() {
      if (!this.addons || this.addons.length === 0) return [];
      return this.addons.map((a) => ({
        provider_addon_id: a.provider_addon_id || a.id || a.addonId || a,
        qty: a.qty || 1,
      }));
    },
    async fetchCustomerAddresses(customerId) {
      this.addressList = [];
      try {
        const { data } = await api.get(`/api/customer/${customerId}/addresses`);
        if (data?.success) this.addressList = data.data.addresses || [];
        else
          this.$swal.fire(
            "No addresses found",
            data?.message || "Customer has no saved addresses.",
            "info"
          );
      } catch (err) {
        console.error("Error fetching addresses:", err);
        this.$swal.fire(
          "Error",
          err?.response?.data?.message || "Failed to load addresses",
          "error"
        );
      }
    },
    setSelectedAddress(addressId) {
      const address = this.addressList.find((a) => a.address_id === addressId);
      if (address) {
        this.form.address = address.address_line;
        this.pincode = address.postal_code;
      }
    },
    previewBooking() {
      if (!this.selectedCustomer)
        return this.$swal.fire("Select customer", "", "warning");
      this.isConfirmMode = false;
      this.previewDialog = true;
    },
    handlePreviewConfirm() {
      this.isConfirmMode = true;
      // optionally store previewData
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
