<template>
  <v-container>
    <!-- Top Button -->
    <div class="d-flex justify-space-between align-center my-2">
      <h4 class="my-auto">Total Paid = {{ totalNetPaid }}</h4>
      <v-btn
        class="my-auto"
        color="primary"
        @click="openAddPaymentDialog = true"
        rounded
        depressed
        >Add Payment</v-btn
      >
    </div>

    <!-- Payments Table -->
    <v-card outlined class="rounded-lg">
      <v-simple-table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Refunded</th>
            <th>Credit Note</th>
            <th>Net Paid</th>
            <th>Gateway</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(payment, index) in payments" :key="index">
            <td>
              <v-btn
                small
                color="primary"
                text
                rounded
                depressed
                @click="viewPaymentSnapFn(payment)"
                >{{ payment.internal_payment_id }}</v-btn
              >
            </td>
            <td>{{ payment.amount }}</td>
            <td>{{ payment.total_refunded }}</td>
            <td>{{ payment.total_credit_note }}</td>
            <td>{{ payment.net_paid }}</td>
            <th>{{ payment.gateway_provider }}</th>
            <td>{{ payment.status }}</td>
            <td>
              <v-btn
                small
                rounded
                depressed
                text
                color="primary"
                class="ml-2"
                @click="updateRefund(payment)"
                >Update Refund</v-btn
              >
              <v-btn
                small
                rounded
                depressed
                text
                color="primary"
                class="ml-2"
                @click="updateRefund(payment)"
                >Issue Credit Note</v-btn
              >
            </td>
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
            <strong>Order ID:</strong> {{ orderId }}
          </div>

          <!-- Form -->
          <v-form ref="form" v-model="formValid" class="mt-4">
            <v-row dense>
              <!-- Gateway Provider -->
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Gateway Provider</label>
                <v-select
                  v-model="paymentForm.gateway_provider"
                  :items="['razorpay', 'cash', 'others']"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required]"
                  placeholder="Select gateway"
                />
              </v-col>

              <!-- Razorpay Specific -->
              <template v-if="paymentForm.gateway_provider === 'razorpay'">
                <v-col cols="12">
                  <label class="text-subtitle-2">Provider Payment ID</label>
                  <v-text-field
                    v-model="paymentForm.provider_payment_id"
                    placeholder="Razorpay Payment ID"
                    dense
                    outlined
                    hide-details
                    :rules="[razorpayRule]"
                  />
                </v-col>
                <v-col cols="12">
                  <label class="text-subtitle-2"
                    >Provider Payment Link ID</label
                  >
                  <v-text-field
                    v-model="paymentForm.provider_payment_link_id"
                    placeholder="Razorpay Payment Link ID"
                    dense
                    outlined
                    hide-details
                    :rules="[razorpayRule]"
                  />
                </v-col>
              </template>

              <!-- Cash/Others -->
              <template v-if="paymentForm.gateway_provider !== 'razorpay'">
                <v-col cols="12" md="6">
                  <label class="text-subtitle-2">Amount</label>
                  <v-text-field
                    v-model="paymentForm.amount"
                    placeholder="Amount paid"
                    dense
                    outlined
                    hide-details
                    type="number"
                    :rules="[rules.required]"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <label class="text-subtitle-2">Method</label>
                  <v-select
                    v-model="paymentForm.method"
                    :items="['cash', 'upi', 'scanner', 'bank_transfer', 'card']"
                    dense
                    outlined
                    hide-details
                    :rules="[rules.required]"
                    placeholder="Select method"
                  />
                </v-col>

                <v-col cols="12">
                  <label class="text-subtitle-2">Comment</label>
                  <v-textarea
                    v-model="paymentForm.comment"
                    placeholder="Mandatory comment"
                    outlined
                    dense
                    rows="2"
                    hide-details
                    :rules="[rules.required]"
                  />
                </v-col>
              </template>
            </v-row>
          </v-form>

          <!-- Action -->
          <div class="d-flex justify-end mt-4">
            <v-btn
              color="primary"
              :disabled="!isPaymentFormValid"
              @click="confirmPayment"
              rounded
              depressed
            >
              Confirm
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <!-- Add Payment Dialog -->
    <!-- <v-dialog v-model="openAddPaymentDialog" max-width="550px">
      <v-card :loading="loading">
        <v-container>
       
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Add Payment</div>
            <v-btn icon @click="openAddPaymentDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

         
          <div class="mt-2 text-subtitle-2">
            <strong>Order ID:</strong> {{ orderId }}
          </div>

        
          <v-form ref="form" v-model="formValid" class="mt-4">
            <v-row dense>
            
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Amount</label>
                <v-text-field
                  v-model="paymentForm.amount"
                  placeholder="Amount paid"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required]"
                />
              </v-col>

        
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Gateway Provider</label>
                <v-select
                  v-model="paymentForm.gateway_provider"
                  :items="['razorpay', 'cash', 'others']"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required]"
                  placeholder="Select gateway"
                />
              </v-col>

           
              <v-col
                cols="12"
                v-if="paymentForm.gateway_provider === 'razorpay'"
              >
                <label class="text-subtitle-2">Provider Payment ID</label>
                <v-text-field
                  v-model="paymentForm.provider_payment_id"
                  placeholder="Razorpay Payment ID"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required]"
                />
              </v-col>

             
              <template
                v-if="
                  paymentForm.gateway_provider === 'cash' ||
                  paymentForm.gateway_provider === 'others'
                "
              >
               
                <v-col cols="12" md="6">
                  <label class="text-subtitle-2">Method</label>
                  <v-select
                    v-model="paymentForm.method"
                    :items="['cash', 'upi', 'scanner', 'bank_transfer', 'card']"
                    dense
                    outlined
                    hide-details
                    :rules="[rules.required]"
                    placeholder="Select method"
                  />
                </v-col>

              
                <v-col cols="12" md="6">
                  <label class="text-subtitle-2">Collection Location</label>
                  <v-text-field
                    v-model="paymentForm.collection_location"
                    placeholder="e.g. Koramangala Hub"
                    dense
                    outlined
                    hide-details
                  />
                </v-col>

        
                <v-col cols="12">
                  <label class="text-subtitle-2">Notes</label>
                  <v-textarea
                    v-model="paymentForm.notes"
                    placeholder="Optional notes"
                    outlined
                    dense
                    rows="2"
                    hide-details
                  />
                </v-col>
              </template>

         
              <v-col cols="12">
                <label class="text-subtitle-2">Payment Date</label>
                <v-text-field
                  v-model="paymentForm.date"
                  type="date"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required]"
                />
              </v-col>
            </v-row>
          </v-form>

  
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
    </v-dialog> -->

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
            <strong>Payment ID:</strong>
            {{ selectedPaymentToView?.internal_payment_id }}
          </div>

          <!-- Form -->
          <v-form ref="refundForm" v-model="refundFormValid" class="mt-4">
            <v-row>
              <!-- Amount -->
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Amount</label>
                <v-text-field
                  v-model="refundForm.amount"
                  placeholder="Enter amount"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required]"
                />
              </v-col>

              <!-- Method -->
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Refund Method</label>
                <v-select
                  v-model="refundForm.method"
                  :items="['back_to_source', 'cash']"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required]"
                />
              </v-col>

              <!-- Refund Reference ID (conditionally visible for back_to_source) -->
              <v-col
                v-if="
                  refundForm.method === 'back_to_source' &&
                  selectedPaymentToView?.gateway_provider != 'cash'
                "
                cols="12"
              >
                <label class="text-subtitle-2">Provider Refund ID</label>
                <v-text-field
                  v-model="refundForm.provider_refund_id"
                  placeholder="e.g. rfnd_xxxxxx"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required]"
                />
              </v-col>

              <!-- Reason -->
              <v-col cols="12">
                <label class="text-subtitle-2">Reason</label>
                <v-textarea
                  v-model="refundForm.reason"
                  outlined
                  dense
                  rows="2"
                  hide-details
                  placeholder="Why are you issuing this refund?"
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
              rounded
              depressed
            >
              Confirm
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewPaymentSnap" max-width="800px">
      <v-card :loading="loading" min-height="550" class="rounded-lg">
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Payment Details</div>
            <v-btn icon @click="viewPaymentSnap = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-divider class="my-2"></v-divider>
          <payment-viewer :payment="selectedPaymentToView"></payment-viewer>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/plugins/axios";
import PaymentViewer from "@/components/PaymentViewer.vue";

export default {
  components: { PaymentViewer },
  name: "PaymentsTab",
  data() {
    return {
      totalPaid: 0,
      totalNetPaid: 0,
      viewPaymentSnap: false,
      selectedPaymentToView: null,
      payments: [],
      openAddPaymentDialog: false,
      openRefundPaymentDialog: false,
      loading: false,
      formValid: false,

      // Updated payment form according to API
      paymentForm: {
        gateway_provider: "", // e.g. "razorpay", "cash", "others" (mandatory)
        provider_payment_id: "", // required only if gateway_provider = razorpay
        provider_payment_link_id: "", // required only if gateway_provider = razorpay
        amount: "", // required if gateway_provider != razorpay
        method: "", // required if gateway_provider != razorpay
        comment: "", // required if gateway_provider != razorpay
      },

      refundFormValid: false,
      selectedPaymentId: null,
      refundForm: {
        amount: 100,
        provider_refund_id: "rfnd_QqBTw1KsGQyw3S",
        reason: "Customer overpaid booking",
        method: "back_to_source",
      },

      rules: {
        required: (v) => !!v || "This field is required",
        razorpayRule: () => {
          if (this.paymentForm.gateway_provider !== "razorpay") return true;
          return (
            this.paymentForm.provider_payment_id ||
            this.paymentForm.provider_payment_link_id ||
            "Either Payment ID or Payment Link ID is required"
          );
        },
      },
    };
  },

  computed: {
    orderId() {
      return this.$route.params.id;
    },
    isPaymentFormValid() {
      if (this.paymentForm.gateway_provider === "razorpay") {
        return (
          this.paymentForm.provider_payment_id.trim() !== "" ||
          this.paymentForm.provider_payment_link_id.trim() !== ""
        );
      } else if (
        this.paymentForm.gateway_provider === "cash" ||
        this.paymentForm.gateway_provider === "others"
      ) {
        return (
          this.paymentForm.amount &&
          this.paymentForm.method &&
          this.paymentForm.comment
        );
      }
      return false;
    },
  },
  mounted() {
    this.loadPayments();
  },
  methods: {
    viewPaymentSnapFn(payment) {
      this.selectedPaymentToView = payment;
      this.viewPaymentSnap = true;
    },
    updateRefund(payment) {
      this.selectedPaymentToView = payment;
      this.openRefundPaymentDialog = true;
    },
    async loadPayments() {
      try {
        const { data } = await api.get(`/api/orders/${this.orderId}/payments`);
        this.totalPaid = data.total_paid || 0;
        this.totalNetPaid = data.total_net_paid || 0;
        this.payments = data.payments || [];
      } catch (error) {
        console.error("Failed to load payments:", error);
        this.payments = [];
      }
    },

    // async confirmPayment() {
    //   this.$refs.form.validate();
    //   if (!this.formValid) return;

    //   try {
    //     this.loading = true;

    //     const payload = {
    //       ...this.paymentForm,
    //       order_id: this.orderId,
    //     };

    //     const response = await api.post("/api/payments", payload);

    //     this.$swal.fire({
    //       icon: "success",
    //       title: "Payment added",
    //       text: response.data.message || "Payment was successfully added.",
    //     });

    //     this.openAddPaymentDialog = false;
    //     this.$emit("payment-success"); // Optional: emit to parent
    //     this.loadPayments();
    //   } catch (err) {
    //     this.$swal.fire({
    //       icon: "error",
    //       title: "Error",
    //       text:
    //         err.response?.data?.error || err.message || "Failed to add payment",
    //     });
    //   } finally {
    //     this.loading = false;
    //   }
    // },
    async confirmPayment() {
      this.$refs.form.validate();
      if (!this.formValid) return;

      try {
        this.loading = true;

        const payload = {
          gateway_provider: this.paymentForm.gateway_provider,
        };

        if (this.paymentForm.gateway_provider === "razorpay") {
          if (
            !this.paymentForm.provider_payment_id &&
            !this.paymentForm.provider_payment_link_id
          ) {
            this.$swal.fire({
              icon: "warning",
              title: "Missing Payment Reference",
              text: "Please provide either Provider Payment ID or Provider Payment Link ID.",
            });
            this.loading = false;
            return;
          }

          payload.provider_payment_id =
            this.paymentForm.provider_payment_id || null;
          payload.provider_payment_link_id =
            this.paymentForm.provider_payment_link_id || null;
        } else {
          payload.amount = Number(this.paymentForm.amount);
          payload.method = this.paymentForm.method;
          payload.notes = this.paymentForm.comment;
        }

        const response = await api.post(
          `/api/order/${this.orderId}/process-payment`,
          payload
        );

        this.$swal.fire({
          icon: "success",
          title: "Payment added",
          text: response.data.message || "Payment was successfully added.",
        });

        this.openAddPaymentDialog = false;

        // ✅ Reset form after success
        this.resetPaymentForm();

        this.$emit("payment-success");
        this.loadPayments();
      } catch (err) {
        this.$swal.fire({
          icon: "error",
          title: "Error",
          text:
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to add payment",
        });
      } finally {
        this.loading = false;
      }
    },
    resetPaymentForm() {
      this.paymentForm = {
        gateway_provider: "",
        provider_payment_id: "",
        provider_payment_link_id: "",
        amount: "",
        method: "",
        comment: "",
      };
      this.formValid = false;
      if (this.$refs.form) this.$refs.form.reset();
    },

    async confirmRefund() {
      this.$refs.refundForm.validate();
      if (!this.refundFormValid) return;
      if (
        this.refundForm.method == "cash" ||
        this.selectedPaymentToView.gateway_provider == "cash"
      ) {
        delete this.refundForm.provider_refund_id;
      }
      this.loading = true;

      try {
        const res = await api.post(
          `api/payments/${this.selectedPaymentToView.payment_id}/refund`,
          this.refundForm
        );

        this.$swal.fire({
          icon: "success",
          title: "Refund Successful",
          text: res.data.message || "Refund has been issued successfully.",
        });

        this.openRefundPaymentDialog = false;
        this.refundForm = {
          amount: "",
          method: "back_to_source",
          provider_refund_id: "",
          reason: "",
        };

        this.loadPayments();
        this.$emit("refund-success"); // if you want to refresh the parent component
      } catch (error) {
        this.$swal.fire({
          icon: "error",
          title: "Refund Failed",
          text:
            error.response?.data?.error ||
            error.message ||
            "An error occurred while issuing the refund.",
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
