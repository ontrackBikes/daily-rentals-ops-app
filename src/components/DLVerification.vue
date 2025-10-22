<template>
  <div>
    <!-- DL STATUS -->
    <div class="d-flex align-center">
      <v-icon small class="mr-1" :color="isDLVerified ? 'green' : 'red'">
        {{
          isDLVerified ? "mdi-check-circle-outline" : "mdi-close-circle-outline"
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
        @click="openDLVerifyDialog = true"
      >
        Verify Now
      </v-chip>
    </div>

    <!-- DL AUTO VERIFY DIALOG -->
    <v-dialog
      v-model="openDLVerifyDialog"
      max-width="500px"
      @input="resetForm('dl')"
    >
      <v-card :loading="verifyingDL">
        <v-container>
          <div class="d-flex justify-space-between align-center mb-2">
            <div class="text-h6 font-weight-bold">DL Verification</div>
            <v-btn icon @click="openDLVerifyDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-form
            ref="dlVerifyForm"
            v-model="valid.dl"
            lazy-validation
            class="my-4"
          >
            <label class="text-subtitle-2"
              >DL Number <span class="red--text">*</span></label
            >
            <v-text-field
              v-model="dlForm.dl_number"
              :rules="[rules.required, rules.dlNumber]"
              outlined
              dense
              hide-details="auto"
              class="mb-3"
            />

            <label class="text-subtitle-2"
              >Date of Birth <span class="red--text">*</span></label
            >
            <v-text-field
              v-model="dlForm.dob"
              type="date"
              :rules="[rules.required]"
              outlined
              dense
              hide-details="auto"
            />
          </v-form>

          <div class="d-flex justify-end mt-4">
            <v-btn
              text
              rounded
              depressed
              class="mr-2"
              @click="openDLVerifyDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              text
              rounded
              depressed
              color="primary"
              class="mr-2"
              @click="openManualDLDialog = true"
            >
              Manual Verification
            </v-btn>
            <v-btn
              color="primary"
              :loading="verifyingDL"
              :disabled="!valid.dl"
              @click="verifyDL"
              rounded
              depressed
            >
              Verify
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <!-- MANUAL DL DIALOG -->
    <v-dialog
      v-model="openManualDLDialog"
      max-width="500px"
      @input="resetForm('manual')"
    >
      <v-card :loading="verifyingManualDL">
        <v-container>
          <div class="d-flex justify-space-between align-center mb-2">
            <div class="text-h6 font-weight-bold">Manual DL Entry</div>
            <v-btn icon @click="openManualDLDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-form
            ref="manualDLForm"
            v-model="valid.manual"
            lazy-validation
            class="my-4"
          >
            <div v-for="field in manualFields" :key="field.model" class="mb-3">
              <label class="text-subtitle-2">{{ field.label }}</label>
              <v-text-field
                v-model="manualDLForm[field.model]"
                :type="field.type || 'text'"
                :rules="field.required ? [rules.required] : []"
                outlined
                dense
                hide-details="auto"
              />
            </div>
          </v-form>

          <div class="d-flex justify-end mt-4">
            <v-btn
              rounded
              text
              class="mr-2"
              @click="openManualDLDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              :loading="verifyingManualDL"
              :disabled="!valid.manual"
              @click="submitManualDL"
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

export default {
  name: "DLVerification",
  props: {
    customerId: { type: Number, required: true },
    dlVerified: { type: Boolean, default: false },
  },
  data() {
    return {
      verifyingDL: false,
      verifyingManualDL: false,
      openDLVerifyDialog: false,
      openManualDLDialog: false,
      valid: { dl: false, manual: false },
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
        class_of_vehicle: "",
      },
      rules: {
        required: (v) => !!v || "Required",
        dlNumber: (v) => {
          const re = /^[A-Z]{2}[- ]?\d{2}[A-Z]?\s?\d{11,13}$/;
          return re.test((v || "").toUpperCase().trim()) || "Invalid DL format";
        },
      },
    };
  },
  computed: {
    isDLVerified() {
      return this.dlVerified;
    },
    manualFields() {
      return [
        { model: "dl_number", label: "DL Number", required: true },
        { model: "name_on_dl", label: "Name on DL", required: true },
        {
          model: "father_or_husband_name",
          label: "Father/Husband Name",
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
      ];
    },
  },
  methods: {
    resetForm(kind) {
      const map = { dl: "dlVerifyForm", manual: "manualDLForm" };
      const ref = map[kind];
      if (ref && this.$refs[ref] && this.$refs[ref].resetValidation) {
        this.$refs[ref].resetValidation();
      }
    },
    async verifyDL() {
      if (!this.$refs.dlVerifyForm.validate()) return;
      this.verifyingDL = true;
      try {
        const payload = {
          customer_id: this.customerId,
          dl_no: this.dlForm.dl_number,
          dob: this.dlForm.dob,
        };
        const res = await api.post("/api/customer/verify-dl", payload);
        if (res.data.success) {
          Swal.fire("Success", "DL verified successfully", "success");
          this.$emit("verified");
          this.openDLVerifyDialog = false;
        } else {
          Swal.fire("Failed", "DL not found. Try manual entry.", "error");
        }
      } catch (e) {
        Swal.fire("Error", e.data.message || "Failed to verify DL", "error");
      } finally {
        this.verifyingDL = false;
      }
    },
    async submitManualDL() {
      if (!this.$refs.manualDLForm.validate()) return;
      this.verifyingManualDL = true;
      try {
        const payload = { customer_id: this.customerId, ...this.manualDLForm };
        const res = await api.post("/api/customer/manual-dl", payload);
        if (res.data.success) {
          Swal.fire("Success", "Manual DL verification successful", "success");
          this.$emit("verified");
          this.openManualDLDialog = false;
        } else {
          Swal.fire("Failed", res.data.message || "Failed to verify", "error");
        }
      } catch (e) {
        Swal.fire("Error", e.message || "Manual verification failed", "error");
      } finally {
        this.verifyingManualDL = false;
      }
    },
  },
};
</script>
