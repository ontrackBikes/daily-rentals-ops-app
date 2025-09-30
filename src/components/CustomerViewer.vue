<template>
  <div>
    <div v-if="!loading && customerData">
      <!-- Status -->
      <div class="d-flex">
        <v-chip
          small
          :color="getStatusColor(customerData.status, 'customer')"
          text-color="white"
          class="font-weight-medium"
        >
          {{ customerData.status }}
        </v-chip>
      </div>

      <!-- Name -->
      <div class="text-subtitle-1 font-weight-bold mt-2">
        {{ customerData.display_name }}
        <v-btn icon small @click="openUpdateCustomerDialog(customerData)">
          <v-icon small color="primary">mdi-pencil</v-icon>
        </v-btn>
      </div>

      <!-- Email -->
      <div
        class="grey--text text--darken-1 text-body-2 mt-1 d-flex align-center"
      >
        <v-icon small color="indigo" class="mr-1">mdi-email</v-icon>
        {{ customerData.email }}
      </div>

      <!-- Phone -->
      <div
        class="grey--text text--darken-1 text-body-2 mt-1 d-flex align-center"
      >
        <v-icon small color="indigo" class="mr-1">mdi-phone</v-icon>
        {{ customerData.user_data?.phone }}
      </div>

      <v-divider class="my-4" />

      <!-- DL Verification -->
      <div class="text-subtitle-2 font-weight-medium mb-1">DL Verification</div>
      <div class="d-flex align-center">
        <v-icon
          small
          class="mr-1"
          :color="customerData.dl_verified ? 'green' : 'red'"
        >
          {{
            customerData.dl_verified
              ? "mdi-check-circle-outline"
              : "mdi-close-circle-outline"
          }}
        </v-icon>
        <span class="text-body-2 grey--text">
          {{ customerData.dl_verified ? "Verified" : "Not Verified" }}
        </span>
        <v-chip
          v-if="!customerData.dl_verified"
          small
          class="ml-2"
          color="amber darken-2"
          text-color="black"
          label
          @click="openDLVerifyDialog = true"
        >
          Verify Now
        </v-chip>
      </div>

      <!-- ID Verification -->
      <div class="text-subtitle-2 font-weight-medium mt-3 mb-1">
        ID Verification
      </div>
      <div class="d-flex align-center">
        <v-icon
          small
          class="mr-1"
          :color="customerData.id_verified ? 'green' : 'red'"
        >
          {{
            customerData.id_verified
              ? "mdi-check-circle-outline"
              : "mdi-close-circle-outline"
          }}
        </v-icon>
        <span class="text-body-2 grey--text">
          {{ customerData.id_verified ? "Verified" : "Not Verified" }}
        </span>
        <v-chip
          v-if="!customerData.id_verified"
          small
          class="ml-2"
          color="amber darken-2"
          text-color="black"
          label
          @click="openIDVerifyDialog = true"
        >
          Verify Now
        </v-chip>
      </div>
    </div>

    <!-- Update Customer Dialog -->
    <v-dialog v-model="updateCustomerDialog" max-width="500px">
      <v-card :loading="loading">
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Update Customer</div>
            <v-btn icon @click="updateCustomerDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Form -->
          <div class="my-4">
            <v-form ref="updateForm" v-model="formValid">
              <!-- Name -->
              <label class="text-subtitle-2">
                Name <span class="red--text">*</span>
              </label>
              <div class="mb-3">
                <v-text-field
                  v-model="customerData.display_name"
                  :rules="[rules.required]"
                  required
                  outlined
                  dense
                  hide-details
                />
              </div>

              <!-- Phone (readonly) -->
              <label class="text-subtitle-2">Phone</label>
              <div class="mb-3">
                <v-text-field
                  v-model="customerData.user_data.phone"
                  readonly
                  outlined
                  dense
                  hide-details
                />
              </div>

              <!-- Email -->
              <label class="text-subtitle-2">
                Email <span class="red--text">*</span>
              </label>
              <div class="mb-3">
                <v-text-field
                  v-model="customerData.email"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  required
                  outlined
                  dense
                  hide-details
                />
              </div>

              <!-- Address -->
              <label class="text-subtitle-2">Address</label>
              <div class="mb-3">
                <v-textarea
                  v-model="customerData.address"
                  outlined
                  dense
                  rows="2"
                  hide-details
                />
              </div>

              <!-- Error Alert -->
              <v-alert v-if="errorMessage" type="error" dense class="mt-2">
                {{ errorMessage }}
              </v-alert>
            </v-form>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex justify-end my-2">
            <v-btn text @click="updateCustomerDialog = false" class="mr-2">
              Cancel
            </v-btn>
            <v-btn
              color="success"
              :disabled="!formValid"
              @click="updateCustomer"
            >
              Update
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <!-- Dialog 1: DL Verify -->
    <v-dialog v-model="openDLVerifyDialog" max-width="500px">
      <v-card :loading="loading">
        <v-container>
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">DL Verification</div>
            <v-btn icon @click="openDLVerifyDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-form ref="dlVerifyForm" v-model="dlVerifyValid" class="my-4">
            <label class="text-subtitle-2"
              >DL Number <span class="red--text">*</span></label
            >
            <div class="mb-3">
              <v-text-field
                v-model="dlForm.dl_number"
                :rules="[rules.required, rules.dlNumber]"
                outlined
                dense
                hide-details
              />
            </div>

            <label class="text-subtitle-2"
              >Date of Birth <span class="red--text">*</span></label
            >
            <div class="mb-3">
              <v-text-field
                v-model="dlForm.dob"
                type="date"
                :rules="[rules.required]"
                outlined
                dense
                hide-details
              />
            </div>
          </v-form>

          <div class="d-flex justify-end my-2">
            <v-btn text @click="openDLVerifyDialog = false" class="mr-2"
              >Cancel</v-btn
            >
            <v-btn color="primary" :disabled="!dlVerifyValid" @click="verifyDL"
              >Verify Now</v-btn
            >
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <!-- Dialog 2: Manual DL -->
    <v-dialog v-model="openManualDLDialog" max-width="500px">
      <v-card :loading="loading">
        <v-container>
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Manual DL Entry</div>
            <v-btn icon @click="openManualDLDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-form ref="manualDLForm" v-model="manualDLValid" class="my-4">
            <template v-for="field in manualFields">
              <label class="text-subtitle-2" :key="field.model + '-label'">
                {{ field.label }}
                <span v-if="field.required" class="red--text">*</span>
              </label>
              <div class="mb-3" :key="field.model">
                <v-text-field
                  v-model="manualDLForm[field.model]"
                  :type="field.type || 'text'"
                  :rules="field.required ? [rules.required] : []"
                  outlined
                  dense
                  hide-details
                />
              </div>
            </template>
          </v-form>

          <div class="d-flex justify-end my-2">
            <v-btn text @click="openManualDLDialog = false" class="mr-2"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              :disabled="!manualDLValid"
              @click="submitManualDL"
              >Verify</v-btn
            >
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <!-- ID Verification Dialog -->
    <v-dialog v-model="openIDVerifyDialog" max-width="500px">
      <v-card :loading="loadingIDVerify">
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">ID Verification</div>
            <v-btn icon @click="openIDVerifyDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Form -->
          <v-form ref="idFormRef" v-model="idFormValid" class="my-4">
            <!-- ID Type -->
            <label class="text-subtitle-2"
              >ID Type <span class="red--text">*</span></label
            >
            <div class="mb-3">
              <v-select
                v-model="idForm.id_type"
                :items="['Aadhaar', 'PAN', 'Voter ID']"
                :rules="[rules.required]"
                outlined
                dense
                hide-details
                placeholder="Select ID Type"
              />
            </div>

            <!-- ID Number -->
            <label class="text-subtitle-2"
              >ID Number <span class="red--text">*</span></label
            >
            <div class="mb-3">
              <v-text-field
                v-model="idForm.id_number"
                :rules="[rules.required, rules.idFormat]"
                outlined
                dense
                hide-details
              />
            </div>

            <!-- Name on ID -->
            <label class="text-subtitle-2"
              >Name on ID <span class="red--text">*</span></label
            >
            <div class="mb-3">
              <v-text-field
                v-model="idForm.name"
                :rules="[rules.required, rules.alphaOnly]"
                outlined
                dense
                hide-details
              />
            </div>

            <!-- DOB -->
            <label class="text-subtitle-2"
              >Date of Birth <span class="red--text">*</span></label
            >
            <div class="mb-3">
              <v-text-field
                v-model="idForm.dob"
                type="date"
                :rules="[rules.required, rules.dob]"
                outlined
                dense
                hide-details
              />
            </div>
          </v-form>

          <!-- Actions -->
          <div class="d-flex justify-end my-2">
            <v-btn text @click="openIDVerifyDialog = false" class="mr-2"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              :disabled="!idFormValid"
              @click="submitIDVerify"
            >
              Verify
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "@/plugins/axios";
import Swal from "sweetalert2";
import StatusService from "@/plugins/statusColor";

export default {
  props: {
    customer: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      loading: false,
      loadingIDVerify: false,
      customer_id: null,
      customerData: null,

      // Dialog controls
      openDLVerifyDialog: false,
      openIDVerifyDialog: false,
      openManualDLDialog: false,
      updateCustomerDialog: false,

      // Forms
      dlForm: {
        dl_number: "",
        dob: "",
      },
      idForm: {
        id_type: "",
        id_number: "",
        name: "",
        dob: "",
      },
      manualDLForm: {
        dl_number: "",
        dob: "",
        holder_name: "",
        valid_from: "",
        gender: "",
        address: "",
        vehicle_class: "",
        state: "",
      },

      // Valid flags
      dlVerifyValid: false,
      manualDLValid: false,
      idFormValid: false,
      formValid: false,

      // Validation rules
      rules: {
        required: (v) => !!v || "Required",
        dlNumber: (v) =>
          /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4,7}$/.test(v) ||
          "DL Number must be like 'UP32AB1234567'",
        alphaOnly: (v) => /^[A-Za-z\s]+$/.test(v) || "Only alphabets allowed",
        idFormat: (v) =>
          /^[A-Z0-9]{6,20}$/.test(v) || "Invalid ID number format",
        email: (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
        // Optional DOB format rule (if needed)
        dob: (v) => !!v || "Date of Birth is required",
      },

      errorMessage: "",
    };
  },

  watch: {
    customer: {
      handler(newCustomer) {
        if (newCustomer?.customer_id) {
          this.customer_id = newCustomer.customer_id;
          this.customerData = { ...newCustomer };
          // this.loadCustomer(); // Uncomment if you want to refetch fresh data
        }
      },
      immediate: true,
      deep: true,
    },
  },

  computed: {
    manualFields() {
      return [
        { model: "dl_number", label: "DL Number", required: true },
        { model: "dob", label: "Date of Birth", type: "date", required: true },
        { model: "holder_name", label: "Holder Name", required: true },
        {
          model: "valid_from",
          label: "Valid From",
          type: "date",
          required: true,
        },
        {
          model: "gender",
          label: "Gender",
          type: "select",
          items: ["Male", "Female"],
          required: true,
        },
        { model: "address", label: "Permanent Address", required: true },
        { model: "vehicle_class", label: "Vehicle Class", required: true },
        { model: "state", label: "State", required: true },
      ];
    },
  },

  methods: {
    async loadCustomer() {
      this.loading = true;
      try {
        const { data } = await api.get(`/api/customer/${this.customer_id}`);
        this.customerData = data.data || null;
      } catch (error) {
        console.error("Error loading customer:", error);
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Failed to load customer data",
          icon: "error",
        });
      } finally {
        this.loading = false;
      }
    },

    async updateCustomer() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await api.put(
          `/api/customer/${this.customerData.customer_id}`,
          {
            display_name: this.customerData.display_name,
            email: this.customerData.email,
            phone: this.customerData.user_data?.phone,
            address: this.customerData.address,
          }
        );

        Swal.fire({
          icon: "success",
          title: "Updated Customer",
          text: response.data.message || "Customer updated successfully.",
          confirmButtonColor: "#198754",
        });

        this.updateCustomerDialog = false;
        this.loadCustomer();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Something went wrong.";
        console.error("Update error:", error);
      } finally {
        this.loading = false;
      }
    },

    verifyDL() {
      if (!this.$refs.dlVerifyForm?.validate()) return;

      this.loading = true;
      setTimeout(() => {
        this.loading = false;

        const isMatch = this.dlForm.dl_number === "UP123456"; // dummy check

        if (isMatch) {
          Swal.fire("DL Verified", "DL is valid", "success").then(() => {
            this.customerData.dl_verified = true;
            this.openDLVerifyDialog = false;
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "DL Not Verified",
            text: "DL details not found. Try manual entry.",
            confirmButtonText: "Verify Manually",
          }).then(() => {
            this.openDLVerifyDialog = false;
            this.openManualDLDialog = true;
          });
        }
      }, 1000);
    },

    submitManualDL() {
      if (!this.$refs.manualDLForm?.validate()) return;

      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        Swal.fire(
          "Verified",
          "Manual DL verification successful",
          "success"
        ).then(() => {
          this.customerData.dl_verified = true;
          this.openManualDLDialog = false;
        });
      }, 1000);
    },

    submitIDVerify() {
      if (!this.$refs.idFormRef?.validate()) return;

      this.loadingIDVerify = true;
      setTimeout(() => {
        this.loadingIDVerify = false;

        const isValid = this.idForm.id_number?.length >= 6;

        if (isValid) {
          Swal.fire("Success", "ID Verified", "success").then(() => {
            this.customerData.id_verified = true;
            this.openIDVerifyDialog = false;
          });
        } else {
          Swal.fire("Failed", "ID could not be verified", "error");
        }
      }, 1000);
    },

    openUpdateCustomerDialog(customer) {
      this.customerData = { ...customer };
      this.updateCustomerDialog = true;
    },

    getStatusColor(status, type) {
      return StatusService.getColor(status, type);
    },
  },
};
</script>
