<template>
  <div>
    <v-skeleton-loader
      v-if="loading"
      type="chip, list-item-two-line, divider, list-item, list-item, divider"
      class="mb-3"
    />
    <v-alert v-else-if="loadError" type="error" dense outlined class="mb-3">
      {{ loadError }}
      <v-btn
        small
        text
        rounded
        depressed
        color="primary"
        class="ml-2"
        @click="loadCustomer"
        >Retry</v-btn
      >
    </v-alert>

    <div v-else-if="customerData">
      <div class="d-flex justify-space-between align-center">
        <div class="text-subtitle-1 font-weight-bold">
          {{ customerData.display_name }}
          {{ customerData.dl_verification_data.verified }}
          <v-btn icon small @click="openUpdateCustomerDialog(customerData)">
            <v-icon small color="primary">mdi-pencil</v-icon>
          </v-btn>
        </div>

        <v-chip
          small
          :color="getStatusColor(customerData.status, 'customer')"
          text-color="white"
          class="font-weight-medium"
        >
          {{ customerData.status }}
        </v-chip>
      </div>

      <div
        class="grey--text text--darken-1 text-body-2 mt-1 d-flex align-center"
      >
        <v-icon small color="indigo" class="mr-1">mdi-phone</v-icon>
        {{ customerPhone }}
      </div>

      <div class="text-body-2 mt-1">
        <v-icon small color="indigo" class="mr-1">mdi-email</v-icon>
        {{
          customerData.customer_contact_data.find((c) => c.type === "email")
            ?.value
        }}
      </div>

      <v-divider class="my-4" />

      <div class="text-subtitle-2 font-weight-medium mb-1">DL Verification</div>
      <DLVerification
        :customer-id="customerData.customer_id"
        :dl-verified="isDLVerified"
        @verified="loadCustomer"
      />

      <div class="text-subtitle-2 font-weight-medium mt-3 mb-1">
        ID Verification
      </div>
      <div class="d-flex align-center">
        <v-icon small class="mr-1" :color="isIDVerified ? 'green' : 'red'">
          {{
            isIDVerified
              ? "mdi-check-circle-outline"
              : "mdi-close-circle-outline"
          }}
        </v-icon>
        <span class="text-body-2 grey--text">
          {{ isIDVerified ? "Verified" : "Not Verified" }}
        </span>
        <v-chip
          v-if="!isIDVerified"
          small
          class="ml-2"
          color="amber darken-2"
          text-color="black"
          @click="openIDVerifyDialog = true"
        >
          Verify Now
        </v-chip>
      </div>
    </div>

    <div v-else class="grey--text text--darken-1 text-body-2">
      No customer found.
    </div>

    <v-dialog
      v-model="updateCustomerDialog"
      max-width="500px"
      @input="onDialogToggle('update')"
    >
      <v-card :loading="updating">
        <v-container>
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Update Customer</div>
            <v-btn icon @click="updateCustomerDialog = false"
              ><v-icon>mdi-close</v-icon></v-btn
            >
          </div>

          <v-form
            ref="updateForm"
            v-model="valid.update"
            lazy-validation
            class="my-4"
          >
            <label class="text-subtitle-2">
              Name <span class="red--text">*</span>
            </label>
            <div class="mb-3">
              <v-text-field
                v-model="editCustomer.display_name"
                :rules="[rules.required]"
                required
                outlined
                dense
                hide-details="auto"
              />
            </div>

            <label class="text-subtitle-2">Phone</label>
            <div class="mb-3">
              <v-text-field
                v-model="editCustomer.user_data.phone"
                readonly
                outlined
                dense
                hide-details="auto"
              />
            </div>

            <label class="text-subtitle-2">Address</label>
            <div class="mb-3">
              <v-textarea
                v-model="editCustomer.address"
                outlined
                dense
                rows="2"
                hide-details="auto"
              />
            </div>
          </v-form>

          <v-alert v-if="updateError" type="error" dense outlined class="mt-2">
            {{ updateError }}
          </v-alert>

          <div class="d-flex justify-end my-2">
            <v-btn
              rounded
              depressed
              text
              class="mr-2"
              @click="updateCustomerDialog = false"
              >Cancel</v-btn
            >
            <v-btn
              color="success"
              :loading="updating"
              :disabled="!valid.update"
              @click="updateCustomer"
              rounded
              depressed
            >
              Update
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="openIDVerifyDialog"
      max-width="600px"
      @input="onDialogToggle('id')"
    >
      <v-card :loading="verifyingID">
        <v-container>
          <div class="d-flex justify-space-between align-center mb-2">
            <div class="text-h6 font-weight-bold">Manual KYC Verification</div>
            <v-btn icon @click="openIDVerifyDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-form
            ref="idFormRef"
            v-model="valid.id"
            lazy-validation
            class="my-4"
          >
            <!-- Document Type -->
            <label class="text-subtitle-2"
              >Document Type <span class="red--text">*</span></label
            >
            <v-select
              v-model="idForm.document_type"
              :items="[
                'aadhaar',
                'pan',
                'passport',
                'voter_id',
                'bank_account',
                'upi',
              ]"
              :rules="[rules.required]"
              outlined
              dense
              hide-details="auto"
              class="mb-3"
            />

            <!-- Document Number -->
            <label class="text-subtitle-2"
              >Document Number <span class="red--text">*</span></label
            >
            <v-text-field
              v-model="idForm.document_number"
              :rules="[rules.required]"
              outlined
              dense
              hide-details="auto"
              class="mb-3"
            />

            <!-- Name -->
            <label class="text-subtitle-2"
              >Name on Document <span class="red--text">*</span></label
            >
            <v-text-field
              v-model="idForm.name"
              :rules="[rules.required, rules.alphaOnly]"
              outlined
              dense
              hide-details="auto"
              class="mb-3"
            />

            <!-- Date of Birth -->
            <label class="text-subtitle-2"
              >Date of Birth <span class="red--text">*</span></label
            >
            <v-text-field
              v-model="idForm.date_of_birth"
              type="date"
              :rules="[rules.required]"
              outlined
              dense
              hide-details="auto"
              class="mb-3"
            />

            <!-- Gender -->
            <label class="text-subtitle-2"
              >Gender <span class="red--text">*</span></label
            >
            <v-select
              v-model="idForm.gender"
              :items="['male', 'female', 'other']"
              :rules="[rules.required]"
              outlined
              dense
              hide-details="auto"
              class="mb-3"
            />

            <!-- Father Name -->
            <label class="text-subtitle-2"
              >Father Name <span class="red--text">*</span></label
            >
            <v-text-field
              v-model="idForm.father_name"
              :rules="[rules.required, rules.alphaOnly]"
              outlined
              dense
              hide-details="auto"
              class="mb-3"
            />

            <!-- Address -->
            <div class="mt-4 mb-2 font-weight-bold text-subtitle-1">
              Address
            </div>

            <label class="text-subtitle-2"
              >Address Line <span class="red--text">*</span></label
            >
            <v-text-field
              v-model="idForm.address.address_line"
              :rules="[rules.required]"
              outlined
              dense
              hide-details="auto"
              class="mb-3"
            />

            <label class="text-subtitle-2"
              >Pincode <span class="red--text">*</span></label
            >
            <v-text-field
              v-model="idForm.address.pincode"
              :rules="[rules.required]"
              outlined
              dense
              hide-details="auto"
              class="mb-3"
            />

            <!-- Dynamic State Dropdown -->
            <label class="text-subtitle-2"
              >State <span class="red--text">*</span></label
            >
            <v-select
              v-model="idForm.address.state_id"
              :items="states"
              item-text="state_name"
              item-value="state_id"
              :loading="statesLoading"
              :rules="[rules.required]"
              outlined
              dense
              hide-details="auto"
              class="mb-3"
              placeholder="Select state"
            />

            <label class="text-subtitle-2"
              >District <span class="red--text">*</span></label
            >
            <v-text-field
              v-model="idForm.address.district"
              :rules="[rules.required]"
              outlined
              dense
              hide-details="auto"
              class="mb-3"
            />

            <label class="text-subtitle-2"
              >Country <span class="red--text">*</span></label
            >
            <v-text-field
              v-model="idForm.address.country"
              :rules="[rules.required]"
              outlined
              dense
              hide-details="auto"
              class="mb-3"
            />

            <!-- Upload Front Image -->
            <!-- Document Front Image -->
            <label class="text-subtitle-2"
              >Front Image <span class="red--text">*</span></label
            >
            <upload-image
              type="kyc"
              @uploaded="(url) => (idForm.document_front_image_url = url)"
            />

            <!-- Document Back Image -->
            <label class="text-subtitle-2"
              >Back Image <span class="red--text">*</span></label
            >
            <upload-image
              type="kyc"
              @uploaded="(url) => (idForm.document_back_image_url = url)"
            />
          </v-form>

          <div class="d-flex justify-end my-2">
            <v-btn rounded text class="mr-2" @click="openIDVerifyDialog = false"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              :loading="verifyingID"
              :disabled="!valid.id || uploading.front || uploading.back"
              @click="submitIDVerify"
              rounded
              depressed
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
import UploadImage from "@/components/UploadImage.vue";
import DLVerification from "@/components/DLVerification.vue";

export default {
  name: "CustomerDetails",
  props: {
    customer_id: { type: Number, required: true },
  },
  components: {
    UploadImage,
    DLVerification,
  },
  data() {
    return {
      // base
      loading: false,
      loadError: "",
      customerData: null,

      // actions
      updating: false,
      verifyingID: false,
      uploading: {
        front: false,
        back: false,
      },
      // dialogs
      updateCustomerDialog: false,
      openIDVerifyDialog: false,

      // forms
      editCustomer: {
        display_name: "",
        user_data: { phone: "" },
        address: "",
        email: "",
      },
      frontImageFile: null,
      backImageFile: null,
      states: [],
      idForm: {
        document_type: null,
        document_number: "",
        name: "",
        date_of_birth: "",
        gender: "",
        father_name: "",
        address: {
          address_line: "",
          pincode: "",
          state_id: "",
          district: "",
          country: "",
        },
        document_front_image_url: "",
        document_back_image_url: "",
      },

      // validity
      valid: { update: false, dl: false, manual: false, id: false },

      // errors
      updateError: "",

      // rules
      rules: {
        required: (v) => !!v || "Required",
        dlNumber: (v) => {
          const val = (v || "").toUpperCase().trim();
          const re = /^[A-Z]{2}[- ]?\d{2}[A-Z]?\s?\d{11,13}$/;
          return (
            re.test(val) ||
            "Invalid DL number. Supported: DL-1420110012345, DL14 20110012345, RJ02A20200000736, KA4720180102021"
          );
        },
        alphaOnly: (v) => /^[A-Za-z\s]+$/.test(v) || "Only alphabets allowed",
        idFormat: (v) =>
          /^[A-Z0-9]{6,20}$/.test(v) || "Invalid ID number format",
        dob: (v) => !!v || "Date of Birth is required",
      },
    };
  },
  computed: {
    customerPhone() {
      return this.customerData && this.customerData.user_data
        ? this.customerData.user_data.phone
        : "";
    },
    isDLVerified() {
      const c = this.customerData || {};
      const dlData = Array.isArray(c.dl_verification_data)
        ? c.dl_verification_data[0]
        : null;
      return (dlData && dlData.verified === true) || c.dl_verified === true;
    },
    isIDVerified() {
      const c = this.customerData || {};
      return !!c.id_verified;
    },
  },
  mounted() {
    this.loadCustomer();
    this.fetchStates();
  },
  methods: {
    parseError(error) {
      let msg = "Something went wrong";
      if (error) {
        if (error.response && error.response.data) {
          msg = error.response.data.message || error.response.data.error || msg;
        } else if (error.message) {
          msg = error.message;
        }
      }
      return msg;
    },
    async loadCustomer() {
      this.loading = true;
      this.loadError = "";
      try {
        const { data } = await api.get(`/api/customer/${this.customer_id}`);
        this.customerData = (data && data.data) || null;
      } catch (e) {
        this.loadError = this.parseError(e);
      } finally {
        this.loading = false;
      }
    },
    onDialogToggle(kind) {
      // Reset validation when a dialog opens
      this.$nextTick(() => {
        const map = {
          update: "updateForm",
          dl: "dlVerifyForm",
          manual: "manualDLForm",
          id: "idFormRef",
        };
        const ref = map[kind];
        if (ref && this.$refs[ref] && this.$refs[ref].resetValidation) {
          this.$refs[ref].resetValidation();
        }
      });
    },
    openUpdateCustomerDialog(customer) {
      const base = JSON.parse(
        JSON.stringify(customer || this.customerData || {})
      );
      base.user_data = base.user_data || { phone: "" };
      this.editCustomer = base;
      this.updateError = "";
      this.updateCustomerDialog = true;
    },
    async updateCustomer() {
      if (this.$refs.updateForm && !this.$refs.updateForm.validate()) return;
      this.updating = true;
      this.updateError = "";
      try {
        const payload = {
          display_name: this.editCustomer.display_name,
          email: this.editCustomer.email,
          phone:
            (this.editCustomer.user_data &&
              this.editCustomer.user_data.phone) ||
            "",
          address: this.editCustomer.address,
        };
        const res = await api.put(
          `/api/customer/${
            this.editCustomer.customer_id ||
            (this.customerData && this.customerData.customer_id)
          }`,
          payload
        );
        Swal.fire({
          icon: "success",
          title: "Updated Customer",
          text:
            (res && res.data && res.data.message) ||
            "Customer updated successfully.",
        });
        this.updateCustomerDialog = false;
        await this.loadCustomer();
      } catch (e) {
        this.updateError = this.parseError(e);
        Swal.fire({
          icon: "error",
          title: "Update failed",
          text: this.updateError,
        });
      } finally {
        this.updating = false;
      }
    },
    async fetchStates() {
      this.statesLoading = true;
      try {
        const { data } = await api.get("/api/states");
        this.states = data?.data?.states || [];
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: "Failed to Load States",
          text: this.parseError(e),
        });
      } finally {
        this.statesLoading = false;
      }
    },

    async submitIDVerify() {
      if (this.$refs.idFormRef && !this.$refs.idFormRef.validate()) return;
      this.verifyingID = true;
      try {
        const payload = {
          document_type: this.idForm.document_type,
          document_number: this.idForm.document_number,
          name: this.idForm.name,
          date_of_birth: this.idForm.date_of_birth,
          gender: this.idForm.gender,
          father_name: this.idForm.father_name,
          address: {
            address_line: this.idForm.address.address_line,
            pincode: this.idForm.address.pincode,
            state_id: Number(this.idForm.address.state_id),
            district: this.idForm.address.district,
            country: this.idForm.address.country,
          },
          document_front_image_url: this.idForm.document_front_image_url,
          document_back_image_url: this.idForm.document_back_image_url,
          remarks: "Manual verification completed by admin",
        };

        const customerId = this.customerData.customer_id;
        await api.post(`/api/customer/${customerId}/kyc-manual`, payload);

        Swal.fire("Success", "KYC verified successfully", "success");
        this.customerData.verification_status = "verified";
        this.loadCustomer();
        this.openIDVerifyDialog = false;
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: "KYC Verification Failed",
          text: this.parseError(e),
        });
      } finally {
        this.verifyingID = false;
      }
    },
    openManualFromDL() {
      this.manualDLForm.dl_number =
        this.dlForm.dl_number || this.manualDLForm.dl_number;
      this.manualDLForm.dob = this.dlForm.dob || this.manualDLForm.dob;
      // helpful prefill from customer data where available
      const c = this.customerData || {};
      this.manualDLForm.name_on_dl =
        this.manualDLForm.name_on_dl || c.display_name || "";
      this.manualDLForm.address = this.manualDLForm.address || c.address || "";
      this.manualDLForm.state = this.manualDLForm.state || c.state || "";
      this.manualDLForm.country = this.manualDLForm.country || "India";
      this.openDLVerifyDialog = false;
      this.openManualDLDialog = true;
      this.onDialogToggle("manual");
    },
    getStatusColor(status, type) {
      return StatusService.getColor(status, type);
    },
  },
};
</script>
