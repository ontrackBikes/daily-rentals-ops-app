<template>
  <div>
    <v-skeleton-loader
      v-if="loading"
      type="chip, list-item-two-line, divider, list-item, list-item, divider"
      class="mb-3"
    />
    <v-alert v-else-if="loadError" type="error" dense outlined class="mb-3">
      {{ loadError }}
      <v-btn small text color="primary" class="ml-2" @click="loadCustomer"
        >Retry</v-btn
      >
    </v-alert>

    <div v-else-if="customerData">
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

      <div class="text-subtitle-1 font-weight-bold mt-2">
        {{ customerData.display_name }}
        <v-btn icon small @click="openUpdateCustomerDialog(customerData)">
          <v-icon small color="primary">mdi-pencil</v-icon>
        </v-btn>
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
      <div class="d-flex align-center">
        <v-icon small class="mr-1" :color="isDLVerified ? 'green' : 'red'">
          {{
            isDLVerified
              ? "mdi-check-circle-outline"
              : "mdi-close-circle-outline"
          }}
        </v-icon>
        <span class="text-body-2 grey--text">
          {{ isDLVerified ? "Verified" : "Not Verified" }}
        </span>
        <v-chip
          v-if="!isDLVerified"
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
          label
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
            <v-btn text class="mr-2" @click="updateCustomerDialog = false"
              >Cancel</v-btn
            >
            <v-btn
              color="success"
              :loading="updating"
              :disabled="!valid.update"
              @click="updateCustomer"
              rounded
            >
              Update
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="openDLVerifyDialog"
      max-width="500px"
      @input="onDialogToggle('dl')"
    >
      <v-card :loading="verifyingDL">
        <v-container>
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">DL Verification</div>
            <v-btn icon @click="openDLVerifyDialog = false"
              ><v-icon>mdi-close</v-icon></v-btn
            >
          </div>

          <v-form
            ref="dlVerifyForm"
            v-model="valid.dl"
            lazy-validation
            class="my-4"
          >
            <label class="text-subtitle-2">
              DL Number <span class="red--text">*</span>
            </label>
            <div class="mb-3">
              <v-text-field
                v-model="dlForm.dl_number"
                :rules="[rules.required, rules.dlNumber]"
                outlined
                dense
                hide-details="auto"
                persistent-hint
              />
            </div>

            <label class="text-subtitle-2">
              Date of Birth <span class="red--text">*</span>
            </label>
            <div class="mb-3">
              <v-text-field
                v-model="dlForm.dob"
                type="date"
                :rules="[rules.required]"
                outlined
                dense
                hide-details="auto"
              />
            </div>
          </v-form>

          <div class="d-flex justify-end my-2">
            <v-btn text class="mr-2" @click="openDLVerifyDialog = false"
              >Cancel</v-btn
            >
            <v-btn text color="primary" class="mr-2" @click="openManualFromDL"
              >Manual Verification</v-btn
            >
            <v-btn
              color="primary"
              :loading="verifyingDL"
              :disabled="!valid.dl"
              @click="verifyDL"
            >
              Verify Now
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="openManualDLDialog"
      max-width="500px"
      @input="onDialogToggle('manual')"
    >
      <v-card :loading="verifyingManualDL">
        <v-container>
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Manual DL Entry</div>
            <v-btn icon @click="openManualDLDialog = false"
              ><v-icon>mdi-close</v-icon></v-btn
            >
          </div>

          <v-form
            ref="manualDLForm"
            v-model="valid.manual"
            lazy-validation
            class="my-4"
          >
            <div v-for="field in manualFields" :key="field.model" class="mb-3">
              <label class="text-subtitle-2">
                {{ field.label }}
                <span v-if="field.required" class="red--text">*</span>
              </label>

              <v-select
                v-if="field.type === 'select'"
                v-model="manualDLForm[field.model]"
                :items="field.items"
                :rules="field.required ? [rules.required] : []"
                outlined
                dense
                hide-details="auto"
              />
              <v-text-field
                v-else
                v-model="manualDLForm[field.model]"
                :type="field.type || 'text'"
                :rules="field.required ? [rules.required] : []"
                outlined
                dense
                hide-details="auto"
              />
            </div>
          </v-form>

          <div class="d-flex justify-end my-2">
            <v-btn text class="mr-2" @click="openManualDLDialog = false"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              :loading="verifyingManualDL"
              :disabled="!valid.manual"
              @click="submitManualDL"
            >
              Verify
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="openIDVerifyDialog"
      max-width="500px"
      @input="onDialogToggle('id')"
    >
      <v-card :loading="verifyingID">
        <v-container>
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">ID Verification</div>
            <v-btn icon @click="openIDVerifyDialog = false"
              ><v-icon>mdi-close</v-icon></v-btn
            >
          </div>

          <v-form
            ref="idFormRef"
            v-model="valid.id"
            lazy-validation
            class="my-4"
          >
            <label class="text-subtitle-2">
              ID Type <span class="red--text">*</span>
            </label>
            <div class="mb-3">
              <v-select
                v-model="idForm.id_type"
                :items="['Aadhaar', 'PAN', 'Voter ID']"
                :rules="[rules.required]"
                outlined
                dense
                hide-details="auto"
                placeholder="Select ID Type"
              />
            </div>

            <label class="text-subtitle-2">
              ID Number <span class="red--text">*</span>
            </label>
            <div class="mb-3">
              <v-text-field
                v-model="idForm.id_number"
                :rules="[rules.required, rules.idFormat]"
                outlined
                dense
                hide-details="auto"
              />
            </div>

            <label class="text-subtitle-2">
              Name on ID <span class="red--text">*</span>
            </label>
            <div class="mb-3">
              <v-text-field
                v-model="idForm.name"
                :rules="[rules.required, rules.alphaOnly]"
                outlined
                dense
                hide-details="auto"
              />
            </div>

            <label class="text-subtitle-2">
              Date of Birth <span class="red--text">*</span>
            </label>
            <div class="mb-3">
              <v-text-field
                v-model="idForm.dob"
                type="date"
                :rules="[rules.required, rules.dob]"
                outlined
                dense
                hide-details="auto"
              />
            </div>
          </v-form>

          <div class="d-flex justify-end my-2">
            <v-btn text class="mr-2" @click="openIDVerifyDialog = false"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              :loading="verifyingID"
              :disabled="!valid.id"
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
  name: "CustomerDetails",
  props: {
    customer_id: { type: Number, required: true },
  },
  data() {
    return {
      // base
      loading: false,
      loadError: "",
      customerData: null,

      // actions
      updating: false,
      verifyingDL: false,
      verifyingManualDL: false,
      verifyingID: false,

      // dialogs
      updateCustomerDialog: false,
      openDLVerifyDialog: false,
      openManualDLDialog: false,
      openIDVerifyDialog: false,

      // forms
      editCustomer: {
        display_name: "",
        user_data: { phone: "" },
        address: "",
        email: "",
      },
      dlForm: { dl_number: "", dob: "" },
      manualDLForm: {
        dl_number: "",
        name_on_dl: "",
        father_or_husband_name: "",
        dob: "",
        address: "",
        pincode: "",
        district: "",
        state: "",
        country: "",
        issue_date: "",
        non_transport_valid_from: "",
        non_transport_valid_to: "",
        transport_valid_from: "",
        transport_valid_to: "",
        hazardous_valid_till: "",
        hill_valid_till: "",
        class_of_vehicle: "",
      },
      idForm: { id_type: "", id_number: "", name: "", dob: "" },

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
      return c.verification_status === "verified" || c.dl_verified === true;
    },
    isIDVerified() {
      const c = this.customerData || {};
      return !!c.id_verified;
    },
    manualFields() {
      return [
        { model: "dl_number", label: "DL Number", required: true },
        { model: "name_on_dl", label: "Name on DL", required: true },
        {
          model: "father_or_husband_name",
          label: "Father/Husband's Name",
          required: true,
        },
        { model: "dob", label: "Date of Birth", type: "date", required: true },
        { model: "address", label: "Address", required: true },
        { model: "pincode", label: "Pincode", required: true },
        { model: "district", label: "District", required: true },
        { model: "state", label: "State", required: true },
        { model: "country", label: "Country", required: true },
        {
          model: "issue_date",
          label: "Issue Date",
          type: "date",
          required: true,
        },
        {
          model: "class_of_vehicle",
          label: "Class of Vehicle",
          required: true,
        },
        // optional validity windows
        {
          model: "non_transport_valid_from",
          label: "Non-Transport Valid From",
          type: "date",
        },
        {
          model: "non_transport_valid_to",
          label: "Non-Transport Valid To",
          type: "date",
        },
        {
          model: "transport_valid_from",
          label: "Transport Valid From",
          type: "date",
        },
        {
          model: "transport_valid_to",
          label: "Transport Valid To",
          type: "date",
        },
        {
          model: "hazardous_valid_till",
          label: "Hazardous Valid Till",
          type: "date",
        },
        { model: "hill_valid_till", label: "Hill Valid Till", type: "date" },
      ];
    },
  },
  mounted() {
    this.loadCustomer();
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
    async verifyDL() {
      if (this.$refs.dlVerifyForm && !this.$refs.dlVerifyForm.validate())
        return;
      this.verifyingDL = true;
      try {
        const payload = {
          customer_id: this.customerData.customer_id,
          dl_no: this.dlForm.dl_number,
          dob: this.dlForm.dob,
        };
        const res = await api.post("/api/customer/verify-dl", payload);
        const ok = res && res.data && res.data.success;
        if (ok) {
          Swal.fire({
            icon: "success",
            title: "DL Verified",
            text: "Driving License verification successful.",
          });
          this.customerData.dl_verified = true;
          this.openDLVerifyDialog = false;
        } else {
          Swal.fire({
            icon: "error",
            title: "DL Not Verified",
            text:
              (res && res.data && res.data.message) ||
              "DL details not found. Try manual entry.",
            confirmButtonText: "Verify Manually",
          }).then(() => {
            // prefill manual with available info
            this.manualDLForm.dl_number = this.dlForm.dl_number;
            this.manualDLForm.dob = this.dlForm.dob;
            this.openDLVerifyDialog = false;
            this.openManualDLDialog = true;
          });
        }
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text: this.parseError(e),
        });
      } finally {
        this.verifyingDL = false;
      }
    },
    async submitManualDL() {
      if (this.$refs.manualDLForm && !this.$refs.manualDLForm.validate())
        return;
      this.verifyingManualDL = true;
      try {
        const payload = Object.assign(
          { customer_id: this.customerData.customer_id },
          this.manualDLForm
        );
        const res = await api.post("/api/customer/verify-dl-manual", payload); // uses axios baseURL
        const body = (res && res.data) || {};
        if (body.success) {
          Swal.fire(
            "Verified",
            body.message || "Manual DL verification successful",
            "success"
          );
          // trust server as source of truth and refresh
          this.openManualDLDialog = false;
          await this.loadCustomer();
        } else {
          throw new Error(body.message || "Manual verification failed");
        }
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: "Manual Verification Failed",
          text: this.parseError(e),
        });
      } finally {
        this.verifyingManualDL = false;
      }
    },
    async submitIDVerify() {
      if (this.$refs.idFormRef && !this.$refs.idFormRef.validate()) return;
      this.verifyingID = true;
      try {
        const payload = Object.assign(
          { customer_id: this.customerData.customer_id },
          this.idForm
        );
        await api.post("/api/customer/verify-id", payload);
        Swal.fire("Success", "ID Verified", "success");
        this.customerData.id_verified = true;
        this.openIDVerifyDialog = false;
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: "ID Verification Failed",
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
