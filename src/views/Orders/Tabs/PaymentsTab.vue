<template>
  <v-container>
    <!-- Top Button -->
    <div class="d-flex justify-end my-2">
      <v-btn color="primary" @click="openAddPaymentDialog = true"
        >Add Payment</v-btn
      >
      <v-btn
        color="primary"
        class="ml-2"
        @click="openRefundPaymentDialog = true"
        >Refund</v-btn
      >
    </div>

    <!-- Payments Table -->
    <v-card outlined class="rounded-lg">
      <v-simple-table>
        <thead>
          <tr>
            <th>Amount</th>
            <th>Payment ID</th>
            <th>Method</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(payment, index) in payments" :key="index">
            <td>{{ payment.amount || "N/A" }}</td>
            <td>{{ payment.payment_id || "N/A" }}</td>
            <td>{{ payment.method || "N/A" }}</td>
            <td>{{ payment.status || "N/A" }}</td>
          </tr>
          <tr v-if="!payments.length">
            <td colspan="4" class="text-center">No payments found</td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card>

    <!-- Add Payment Dialog -->
    <v-dialog v-model="openAddPaymentDialog" max-width="550px">
      <v-card :loading="loading">
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Add Payment</div>
            <v-btn icon @click="openAddPaymentDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Order Info -->
          <div class="mt-2 text-subtitle-2">
            <strong>Order ID:</strong> {{ selectedOrderId }}
          </div>

          <!-- Form -->
          <v-form ref="form" v-model="formValid" class="mt-4">
            <v-row>
              <!-- Amount -->
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Amount</label>
                <v-text-field
                  v-model="form.amount"
                  placeholder="Paid, Pending (default)"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required]"
                />
              </v-col>

              <!-- Payment Method -->
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Payment Method</label>
                <v-text-field
                  v-model="form.method"
                  placeholder="upi, cash, credit note"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required]"
                />
              </v-col>

              <!-- Payment Reference ID -->
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Payment Reference ID</label>
                <v-text-field
                  v-model="form.referenceId"
                  placeholder="123ABC456"
                  dense
                  outlined
                  hide-details
                />
              </v-col>

              <!-- Payment Gateway -->
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Payment Gateway</label>
                <v-text-field
                  v-model="form.gateway"
                  placeholder="Razorpay, Phonepe, GooglePay etc"
                  dense
                  outlined
                  hide-details
                />
              </v-col>

              <!-- Payment Date -->
              <v-col cols="12" md="12">
                <label class="text-subtitle-2">Payment Date</label>
                <v-text-field
                  v-model="form.date"
                  type="date"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required]"
                />
              </v-col>

              <!-- Notes -->
              <v-col cols="12" md="12">
                <label class="text-subtitle-2">Notes</label>
                <v-textarea
                  v-model="form.notes"
                  outlined
                  dense
                  rows="2"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-form>

          <!-- Action -->
          <div class="d-flex justify-end mt-4">
            <v-btn
              color="primary"
              :disabled="!formValid"
              @click="confirmPayment"
            >
              Confirm
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <!-- Refund Payment Dailog -->
    <v-dialog v-model="openRefundPaymentDialog" max-width="500px">
      <v-card :loading="loading">
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Add Refund</div>
            <v-btn icon @click="openRefundPaymentDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Refund Info -->
          <div class="mt-2 text-subtitle-2">
            <strong>Payment ID:</strong> {{ selectedPaymentId }}
          </div>

          <!-- Form -->
          <v-form ref="refundForm" v-model="refundFormValid" class="mt-4">
            <v-row>
              <!-- Amount -->
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Amount</label>
                <v-text-field
                  v-model="refundForm.amount"
                  placeholder="Paid, Pending (default)"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required]"
                />
              </v-col>

              <!-- Refund Reference ID -->
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Refund Reference ID</label>
                <v-text-field
                  v-model="refundForm.referenceId"
                  placeholder="Paid, Pending (default)"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required]"
                />
              </v-col>

              <!-- Payment Gateway -->
              <v-col cols="12" md="12">
                <label class="text-subtitle-2">Payment Gateway</label>
                <v-text-field
                  v-model="refundForm.gateway"
                  placeholder="Razorpay, Phonepe, GooglePay etc"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required]"
                />
              </v-col>

              <!-- Notes -->
              <v-col cols="12">
                <label class="text-subtitle-2">Notes</label>
                <v-textarea
                  v-model="refundForm.notes"
                  outlined
                  dense
                  rows="2"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-form>

          <!-- Action -->
          <div class="d-flex justify-end mt-4">
            <v-btn
              color="primary"
              :disabled="!refundFormValid"
              @click="confirmRefund"
            >
              Confirm
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "PaymentsTab",
  props: {
    order: Object,
  },
  data() {
    return {
      payments: [],
      openAddPaymentDialog: false,
      openRefundPaymentDialog: false,
      loading: false,
      formValid: false,
      selectedOrderId: null,
      form: {
        amount: "",
        method: "",
        referenceId: "",
        gateway: "",
        date: "",
        notes: "",
      },

      refundFormValid: false,
      selectedPaymentId: null,
      refundForm: {
        amount: "",
        referenceId: "",
        gateway: "",
        notes: "",
      },
      rules: {
        required: (v) => !!v || "This field is required",
      },
    };
  },
  mounted() {
    this.selectedOrderId = this.order?.order_id || "N/A";
    this.selectedPaymentId = this.order?.Payment?.payment_id || "N/A";
    this.loadPayments();
  },
  methods: {
    async loadPayments() {
      try {
        const { data } = await api.get(
          `/api/orders/${this.order.order_id}/payments`
        );
        this.payments = data.payments || [];
      } catch (error) {
        console.error("Failed to load payments:", error);
        this.payments = [];
      }
    },

    confirmPayment() {
      this.$refs.form.validate();
      if (!this.formValid) return;

      this.loading = true;

      setTimeout(() => {
        this.loading = false;
        this.openAddPaymentDialog = false;

        // Show Payment Captured alert
        this.$swal.fire({
          icon: "success",
          title: "Payment Captured",
          text: "We have verified the payment and the order balance has been updated",
          confirmButtonColor: "#7C4DFF",
          confirmButtonText: "Done",
        });

        // Optionally reload payment data
        this.loadPayments();
      }, 1000);
    },

    confirmRefund() {
      this.$refs.refundForm.validate();
      if (!this.refundFormValid) return;

      this.loading = true;

      setTimeout(() => {
        this.loading = false;
        this.openRefundPaymentDialog = false;

        this.$swal({
          icon: "success",
          title: "Refund Updated",
          text: "We have verified the refund and the order balance has been updated",
          confirmButtonColor: "#7C4DFF",
          confirmButtonText: "Done",
        });

        // Optionally reload data or reset form
      }, 1000);
    },
  },
};
</script>
