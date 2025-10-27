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
                  Customer Details
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

                <!-- <v-textarea
                  v-if="type === 'pickup'"
                  v-model="form.address"
                  label="Complete Address"
                  outlined
                  dense
                  rows="3"
                  :disabled="true"
                  prepend-inner-icon="mdi-map-marker"
                  class="mb-6"
                /> -->
              </v-form>

              <div v-if="selectedCustomer">
                <v-tabs v-model="activeTab" background-color="transparent" grow>
                  <v-tab>Pickup</v-tab>
                  <v-tab>Delivery</v-tab>
                </v-tabs>

                <v-tabs-items v-model="activeTab" class="mt-4 pa-2">
                  <v-tab-item>
                    <v-select
                      v-model="location_id"
                      :items="locations"
                      item-text="name"
                      item-value="location_id"
                      label="Pickup Location"
                      :loading="locationsLoading"
                      outlined
                      dense
                      hide-details
                    />
                  </v-tab-item>

                  <v-tab-item>
                    <div>
                      <!-- Provider location -->
                      <v-select
                        v-model="location_id"
                        :items="locations"
                        item-text="name"
                        item-value="location_id"
                        label="Select Provider Location"
                        :loading="locationsLoading"
                        outlined
                        dense
                        hide-details
                      />

                      <!-- Saved Addresses -->
                      <v-select
                        :key="addressList.length"
                        v-model="selectedAddressId"
                        :items="addressList"
                        item-text="address_line"
                        item-value="address_id"
                        label="Select Saved Address"
                        outlined
                        dense
                        prepend-inner-icon="mdi-map-marker"
                        class="mt-3"
                        :rules="[(v) => !!v || 'Please select an address']"
                        @change="
                          setSelectedAddress && checkServiceability('delivery')
                        "
                      >
                        <!-- Dropdown items -->
                        <template v-slot:item="{ item, on, attrs }">
                          <v-list-item v-bind="attrs" v-on="on">
                            <v-list-item-content>
                              <v-list-item-title>{{
                                item.address_line
                              }}</v-list-item-title>
                              <v-list-item-subtitle>
                                {{ item.postal_code }} | {{ item.type }}
                              </v-list-item-subtitle>
                            </v-list-item-content>

                            <v-list-item-action>
                              <v-btn
                                icon
                                x-small
                                @click.stop="openEditDialog(item)"
                              >
                                <v-icon color="blue">mdi-pencil</v-icon>
                              </v-btn>
                              <v-btn
                                icon
                                x-small
                                @click.stop="deleteAddress(item.address_id)"
                              >
                                <v-icon color="red">mdi-delete</v-icon>
                              </v-btn>
                            </v-list-item-action>
                          </v-list-item>
                        </template>

                        <template v-slot:selection="{ item }">
                          <span v-if="item">
                            {{ item.address_line }} - {{ item.postal_code }}
                          </span>
                          <span v-else>Select Saved Address</span>
                        </template>
                      </v-select>

                      <v-btn
                        color="primary"
                        outlined
                        class="mt-2"
                        small
                        v-model="selectedAddressId"
                        @click="openAddDialog"
                      >
                        + Add Address
                      </v-btn>
                    </div>
                  </v-tab-item>
                </v-tabs-items>

                <v-alert
                  v-if="serviceabilityMsg"
                  :type="isServiceable ? 'success' : 'error'"
                  dense
                  outlined
                  class="mt-4 text-center"
                >
                  {{ serviceabilityMsg }}
                </v-alert>

                <!-- Address Dialog -->
                <v-dialog v-model="addressDialog" max-width="500px">
                  <v-card>
                    <v-card-title class="text-h6">
                      {{ editMode ? "Edit Address" : "Add Address" }}
                    </v-card-title>

                    <v-card-text>
                      <v-text-field
                        v-model="AddresForm.address_line"
                        label="Address Line"
                        outlined
                        dense
                        required
                      />
                      <v-text-field
                        v-model="AddresForm.postal_code"
                        label="Postal Code"
                        outlined
                        dense
                        required
                      />
                      <v-select
                        v-model="AddresForm.city_id"
                        :items="cities"
                        item-text="name"
                        item-value="id"
                        label="City"
                        outlined
                        dense
                        required
                      />
                      <v-text-field
                        v-model="AddresForm.country"
                        label="Country"
                        outlined
                        dense
                        required
                      />
                      <v-select
                        v-model="AddresForm.type"
                        :items="['home', 'work', 'other']"
                        label="Type"
                        outlined
                        dense
                      />
                      <v-switch
                        v-model="AddresForm.is_default"
                        label="Set as Default"
                        inset
                      ></v-switch>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn text @click="addressDialog = false">Cancel</v-btn>
                      <v-btn
                        color="primary"
                        @click="saveAddress"
                        :loading="saving"
                      >
                        {{ editMode ? "Update" : "Save" }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div>
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
            <v-select
              v-model="vehicle_id"
              :items="availableVehicles"
              item-text="registration_number"
              item-value="vehicle_id"
              label="Select Vehicle"
              outlined
              dense
              class="mt-4"
              :disabled="!location_id || availableVehicles.length === 0"
              placeholder="Choose a vehicle"
            />

            <v-divider class="my-4"></v-divider>
            <div class="subtitle-1 font-weight-bold">Payment Summary</div>

            <div>
              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-subtitle-2">Subscription Plan</span>
                <span class="font-weight-bold">{{ subscription }}</span>
              </div>

              <div
                v-if="addons && addons.length > 0"
                class="d-flex justify-space-between mb-3"
              >
                <span class="text-subtitle-2" style="width: 90px">Add-ons</span>
                <div class="d-flex flex-wrap justify-end">
                  <v-chip
                    v-for="(addon, i) in addons"
                    :key="i"
                    class="ma-1"
                    outlined
                    small
                  >
                    {{ addon.addon_name }} x{{ addon.qty }}
                  </v-chip>
                </div>
              </div>

              <div
                class="d-flex justify-space-between align-center mb-3"
                v-if="deliveryCharges > 0"
              >
                <span class="text-subtitle-2">Delivery Charges</span>
                <span class="font-weight-bold"
                  >₹{{ formatAmount(deliveryCharges) }}</span
                >
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
                :disabled="
                  !formValid ||
                  previewLoading ||
                  !location_id ||
                  (activeTab === 1 && isServiceable === false)
                "
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
      :addons="
        addons.map((a) => ({
          provider_addon_id: a.provider_addon_id,
          qty: a.qty,
        }))
      "
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
      deliveryCharges: 0,
      subscription: null,
      addons: [],
      model_id: null,
      pricing_id: null,
      vehicle_id: null,

      pincode: null,
      location_id: null,
      previewDialog: false,
      previewLoading: false,
      isConfirmMode: false,
      addressList: [],
      selectedAddressId: null,

      locations: [],
      locationsLoading: false,
      activeTab: 0,
      deliveryPincode: "",

      addressDialog: false,
      editMode: false,
      saving: false,

      AddresForm: {
        address_line: "",
        postal_code: "",
        city_id: "",
        country: "India",
        latitude: "",
        longitude: "",
        is_default: false,
        type: "home",
      },
      cities: [
        { id: 1, name: "Bangalore" },
        { id: 2, name: "Mumbai" },
        { id: 3, name: "Delhi" },
      ],

      checking: false,
      serviceabilityMsg: "",
      isServiceable: false,
    };
  },
  async created() {
    this.model_id = this.$route.query.modelId || null;
    this.total = parseFloat(this.$route.query.total || 0);
    this.pricing_id = this.$route.query.pricingId || null;
    this.subscription = this.$route.query.subscription || "N/A";

    this.pincode = this.$route.query.pincode || null;

    try {
      this.addons = this.$route.query.addons
        ? JSON.parse(this.$route.query.addons)
        : [];
    } catch (e) {
      this.addons = this.$route.query.addons || [];
    }

    if (this.model_id) await this.loadModel(this.model_id);
  },
  mounted() {
    this.fetchLocations(this.model_id);
  },
  computed: {
    availableVehicles() {
      if (!this.model || !this.location_id) return [];
      return this.model.vehicle_data.filter(
        (v) => v.location_id === this.location_id && v.status === "available"
      );
    },
    type() {
      return this.activeTab === 0 ? "pickup" : "delivery";
    },
  },
  watch: {
    selectedCustomer(newCustomer) {
      if (newCustomer) {
        // Reset fields when customer changes
        this.location_id = null;

        this.activeTab = 0;
        this.deliveryPincode = "";
        this.serviceabilityMsg = "";
        this.isServiceable = false;
      }
    },
    type(newType) {
      if (newType === "delivery") {
        this.fetchCustomerAddresses(this.selectedCustomer.customer_id);
      } else if (newType === "pickup") {
        this.serviceabilityMsg = null;
        this.total = parseFloat(this.$route.query.total || 0);
        this.deliveryCharges = 0;
        this.selectedAddressId = null;
        this.isServiceable = false;
        this.location_id = null;
      }
    },
    location_id(newLocationId, oldLocationId) {
      if (newLocationId !== oldLocationId) {
        this.resetServiceability();
      }
    },
    addressList(newList) {
      if (Array.isArray(newList) && newList.length === 1) {
        // Automatically select the only available address
        this.selectedAddressId = newList[0].address_id;
      }
    },
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
    openAddDialog() {
      this.editMode = false;
      this.resetForm();
      this.addressDialog = true;
    },

    openEditDialog(item) {
      this.editMode = true;

      this.AddresForm = { ...item };
      this.addressDialog = true;
    },

    resetForm() {
      this.AddresForm = {
        address_id: null,
        address_line: "",
        postal_code: "",
        city_id: "",
        country: "India",
        latitude: "",
        longitude: "",
        is_default: false,
        type: "home",
      };
    },

    async saveAddress() {
      const customerId = this.selectedCustomer?.customer_id;
      if (!customerId) return;

      this.saving = true;
      try {
        if (this.editMode) {
          await api.put(
            `/api/customer/${customerId}/address/${this.AddresForm.address_id}`,
            this.AddresForm
          );
          this.$swal.fire("Updated", "Address updated successfully", "success");
        } else {
          await api.post(
            `/api/customer/${customerId}/address`,
            this.AddresForm
          );
          this.$swal.fire("Added", "Address added successfully", "success");
        }

        this.addressDialog = false;
        await this.fetchCustomerAddresses(customerId);
      } catch (err) {
        console.error(err);
        this.$swal.fire(
          "Error",
          err?.response?.data?.message || "Failed to save address",
          "error"
        );
      } finally {
        this.saving = false;
      }
    },

    async deleteAddress(addressId) {
      const customerId = this.selectedCustomer?.customer_id;
      if (!customerId) return;

      const confirm = await this.$swal.fire({
        title: "Delete Address?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
      });

      if (!confirm.isConfirmed) return;

      try {
        await api.delete(`/api/customer/${customerId}/address/${addressId}`);
        this.$swal.fire("Deleted", "Address deleted successfully", "success");
        await this.fetchCustomerAddresses(customerId);
      } catch (err) {
        console.error(err);
        this.$swal.fire(
          "Error",
          err?.response?.data?.message || "Failed to delete address",
          "error"
        );
      }
    },
    resetServiceability() {
      this.serviceabilityMsg = null;
      this.total = parseFloat(this.$route.query.total || 0);
      this.deliveryCharges = 0;
      this.selectedAddressId = null;
      this.isServiceable = false;
    },
    setSelectedAddress(addressId) {
      const address = this.addressList.find((a) => a.address_id === addressId);
      if (address) {
        this.form.address = address.address_line;
        this.pincode = address.postal_code;
      }
    },
    previewBooking() {
      this.previewLoading = true;
      if (!this.selectedCustomer)
        return this.$swal.fire("Select customer", "", "warning");
      this.isConfirmMode = false;
      this.previewDialog = true;
      this.pricingId;
      this.previewLoading = false;
    },
    handlePreviewConfirm() {
      this.isConfirmMode = true;
      // optionally store previewData
    },
    async fetchLocations(modelId) {
      try {
        this.locationsLoading = true;
        const res = await api.get(`/api/vehicle-model/${modelId}/locations`);
        this.locations = res.data?.data?.locations || [];
      } catch (err) {
        console.error("Error fetching locations:", err);
        this.locations = [];
      } finally {
        this.locationsLoading = false;
      }
    },
    async checkServiceability(type) {
      try {
        this.checking = true;
        this.serviceabilityMsg = "";
        this.deliveryCharges = 0; // reset before checking

        const pincode =
          type === "pickup"
            ? "560001"
            : this.selectedAddressId
            ? this.addressList.find(
                (a) => a.address_id === this.selectedAddressId
              )?.postal_code
            : this.deliveryPincode;

        const payload = {
          model_id: this.model_id,
          location_id: this.location_id || 1,
          pincode,
          service_type: type,
        };

        const res = await api.post(`api/serviceable-pincode/check`, payload);

        const data = res.data?.data;
        this.isServiceable = data?.is_serviceable;
        this.serviceabilityMsg = res.data?.message || "Check completed";

        // If delivery and serviceable, store delivery_amount
        if (
          type === "delivery" &&
          this.isServiceable &&
          data?.charges?.delivery_amount
        ) {
          const deliveryAmount = parseFloat(data.charges.delivery_amount) || 0;
          this.deliveryCharges = deliveryAmount;
          this.total = (parseFloat(this.total) || 0) + deliveryAmount;
        }
      } catch (err) {
        console.error("Error checking serviceability:", err);
        this.serviceabilityMsg = "Something went wrong. Please try again.";
        this.isServiceable = false;
        this.deliveryCharges = 0;
      } finally {
        this.checking = false;
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
