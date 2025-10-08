<template>
  <v-card :loading="loading">
    <v-container>
      <!-- Header -->
      <div class="d-flex justify-space-between align-center">
        <div class="text-h6 font-weight-bold">Cancel Booking</div>
        <v-btn icon @click="$emit('close-modal')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Cancel Form -->
      <v-form ref="cancelFormRef" v-model="cancelFormValid" class="my-4">
        <!-- Cancellation Fee -->
        <label class="text-subtitle-2"
          >Cancellation Fee Applicable <span class="error--text">*</span></label
        >
        <v-radio-group
          v-model="cancelForm.cancellation_fee_applicable"
          row
          :rules="[rules.required]"
        >
          <v-radio label="Yes" :value="true"></v-radio>
          <v-radio label="No" :value="false"></v-radio>
        </v-radio-group>

        <!-- Reason -->
        <label class="text-subtitle-2"
          >Reason <span class="error--text">*</span></label
        >
        <v-textarea
          v-model="cancelForm.reason"
          outlined
          dense
          rows="3"
          :rules="[rules.required]"
          hide-details
        />
      </v-form>

      <!-- Actions -->
      <div class="d-flex justify-end my-2">
        <v-btn rounded depressed text @click="$emit('close-modal')" class="mr-2"
          >Cancel</v-btn
        >
        <v-btn
          color="error"
          :disabled="!cancelFormValid"
          @click="submitCancelBooking"
          rounded
          depressed
        >
          Confirm Cancel
        </v-btn>
      </div>
    </v-container>
  </v-card>
</template>

<script>
import api from "@/plugins/axios";

export default {
  props: {
    booking: { type: Object, required: true },
  },
  data() {
    return {
      loading: false,
      cancelFormValid: false,
      cancelForm: {
        cancellation_fee_applicable: null,
        reason: "",
      },
      rules: {
        required: (v) => (v !== null && v !== "") || "Required",
      },
    };
  },
  methods: {
    async submitCancelBooking() {
      if (!this.cancelFormValid) return;

      this.loading = true;
      try {
        const resp = await api.post(
          `/api/booking/${this.booking.booking_id}/cancel`,
          {
            cancellation_fee_applicable:
              this.cancelForm.cancellation_fee_applicable,
            reason: this.cancelForm.reason,
          }
        );

        this.$swal.fire({
          icon: "success",
          title: "Booking Cancelled",
          text:
            resp.data.message || "The booking has been cancelled successfully.",
        });

        // Emit events to parent
        this.$emit("refresh-booking"); // refresh booking details in parent
        this.$emit("close-modal"); // close this modal

        // Optional: reset form
        this.cancelForm.cancellation_fee_applicable = null;
        this.cancelForm.reason = "";
        this.cancelFormValid = false;
      } catch (e) {
        this.$swal.fire({
          icon: "error",
          title: "Error",
          text: e.response?.data?.message || "Failed to cancel booking!",
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
