<template>
  <div class="my-4">
    <v-row dense>
      <!-- LEFT PANEL -->
      <v-col cols="12" md="3">
        <v-chip
          :color="payment.status === 'captured' ? 'green' : 'orange'"
          dark
          small
          class="my-2"
        >
          {{ payment.status }}
        </v-chip>

        <div class="mt-2 text-h5 font-weight-bold">₹{{ payment.amount }}</div>

        <v-card outlined class="my-4 pa-2 rounded-lg">
          <v-row dense>
            <v-col cols="12">
              <div
                class="d-flex justify-space-between align-center text-subtitle-2"
              >
                <span>Refunded:</span>
                <span>₹{{ totalRefunded }}</span>
                <v-btn small rounded text color="primary" @click="activeTab = 1"
                  >View</v-btn
                >
              </div>
            </v-col>
            <v-col cols="12">
              <div
                class="d-flex justify-space-between align-center text-subtitle-2"
              >
                <span>Credit Note:</span>
                <span>₹{{ totalCreditNotes }}</span>
                <v-btn small text rounded color="primary" @click="activeTab = 2"
                  >View</v-btn
                >
              </div>
            </v-col>
          </v-row>
        </v-card>

        <v-card
          color="green lighten-5"
          class="pa-3 my-4 text-center rounded-lg"
          outlined
        >
          <div class="caption font-weight-medium">Net Paid</div>
          <div class="text-h6 font-weight-bold">₹{{ netPaid }}</div>
        </v-card>
      </v-col>

      <!-- RIGHT PANEL -->
      <v-col cols="12" md="9">
        <v-tabs v-model="activeTab" background-color="transparent" grow>
          <v-tab class="font-weight-bold">Overview</v-tab>
          <v-tab class="font-weight-bold">Refunds</v-tab>
          <v-tab class="font-weight-bold">Credit Notes</v-tab>
        </v-tabs>

        <v-tabs-items v-model="activeTab">
          <!-- Overview -->
          <v-tab-item>
            <v-card outlined class="rounded-lg my-4 pa-4">
              <div class="text-subtitle-2 font-weight-medium">
                Payment ID: {{ payment.provider_payment_id || "N/A" }}
              </div>
              <div class="text-subtitle-2 font-weight-medium">
                Order ID: {{ payment.order_id || "N/A" }}
              </div>

              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold mt-4"
              >
                <span>Amount Paid</span>
                <span>₹{{ payment.amount || "N/A" }}</span>
              </div>

              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold"
              >
                <span>Mode</span>
                <span>{{ payment.method.toUpperCase() || "N/A" }}</span>
              </div>

              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold"
              >
                <span>Status</span>
                <span>{{ payment.status || "N/A" }}</span>
              </div>

              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold"
              >
                <span>Date</span>
                <span>{{ formatDate(payment.created_at) || "N/A" }}</span>
              </div>

              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold"
              >
                <span>Refunded Amount</span>
                <span>₹{{ totalRefunded }}</span>
              </div>

              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold"
              >
                <span>Gateway Ref</span>
                <span>{{ payment.vpa || payment.contact || "N/A" }}</span>
              </div>

              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold"
              >
                <span>Fee</span>
                <span>₹{{ parseFloat(payment.fee) / 100 || "N/A" }}</span>
              </div>

              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold"
              >
                <span>Note</span>
                <span
                  >Paid via {{ payment.method.toUpperCase() || "N/A" }}</span
                >
              </div>

              <div
                class="d-flex align-center justify-space-between text-subtitle-1 font-weight-bold"
              >
                <span>Receipt Link</span>

                <a
                  text
                  small
                  color="primary"
                  class="text-decoration-none"
                  :href="
                    'https://yourdomain.com/receipts/' +
                    payment.provider_payment_id
                  "
                  target="_blank"
                >
                  View Receipt<v-icon small color="primary" class="ml-1"
                    >mdi-open-in-new</v-icon
                  >
                </a>
              </div>
            </v-card>
          </v-tab-item>

          <!-- Refunds -->
          <v-tab-item>
            <v-card outlined class="rounded-lg my-4">
              <v-simple-table dense>
                <thead>
                  <tr>
                    <th class="text-left">Refund ID</th>
                    <th class="text-left">Gateway</th>
                    <th class="text-left">Amount</th>
                    <th class="text-left">Reason</th>
                    <th class="text-left">Status</th>
                    <th class="text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in payment.refund_data"
                    :key="item.internal_refund_id"
                  >
                    <td>{{ item.internal_refund_id || "N/A" }}</td>
                    <td>{{ item.gateway_provider || "N/A" }}</td>
                    <td>₹{{ item.amount || 0 }}</td>
                    <td>{{ item.reason || "-" }}</td>
                    <td>
                      <v-chip
                        small
                        :color="
                          item.status === 'success'
                            ? 'green lighten-4'
                            : item.status === 'failed'
                            ? 'red lighten-4'
                            : 'grey lighten-4'
                        "
                        class="font-weight-medium"
                      >
                        {{ item.status }}
                      </v-chip>
                    </td>
                    <td>{{ formatDate(item.created_at) }}</td>
                  </tr>
                  <tr
                    v-if="!payment.refund_data || !payment.refund_data.length"
                  >
                    <td colspan="6" class="text-center grey--text py-4">
                      No refund records found
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card>
          </v-tab-item>

          <!-- Credit Notes -->
          <v-tab-item>
            <v-card outlined class="rounded-lg my-4">
              <v-simple-table dense>
                <thead>
                  <tr>
                    <th class="text-left">Note ID</th>
                    <th class="text-left">Amount</th>
                    <th class="text-left">Used</th>
                    <th class="text-left">Status</th>
                    <th class="text-left">Issued On</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in payment.credit_note_data"
                    :key="item.credit_note_id"
                  >
                    <td>{{ item.credit_note_id || "N/A" }}</td>
                    <td>₹{{ item.original_amount || 0 }}</td>
                    <td>₹{{ item.used_amount || 0 }}</td>
                    <td>
                      <v-chip
                        small
                        :color="
                          item.status === 'active'
                            ? 'green lighten-4'
                            : item.status === 'used'
                            ? 'blue lighten-4'
                            : 'grey lighten-4'
                        "
                        class="font-weight-medium"
                      >
                        {{ item.status }}
                      </v-chip>
                    </td>
                    <td>{{ formatDate(item.issued_on) }}</td>
                  </tr>

                  <tr
                    v-if="
                      !payment.credit_note_data ||
                      !payment.credit_note_data.length
                    "
                  >
                    <td colspan="5" class="text-center grey--text py-4">
                      No credit notes issued.
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "PaymentViewer",
  props: {
    payment: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activeTab: 0,
    };
  },
  computed: {
    totalRefunded() {
      return this.payment.refund_data.reduce(
        (sum, r) => sum + parseFloat(r.amount),
        0
      );
    },
    totalCreditNotes() {
      return this.payment.credit_note_data.reduce(
        (sum, c) => sum + parseFloat(c.original_amount),
        0
      );
    },
    netPaid() {
      return (
        parseFloat(this.payment.amount) -
        this.totalRefunded -
        this.totalCreditNotes
      );
    },
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return "—";
      const date = new Date(dateStr);
      return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    },
  },
};
</script>

<style scoped>
.caption {
  font-size: 12px;
  color: #555;
}
</style>
