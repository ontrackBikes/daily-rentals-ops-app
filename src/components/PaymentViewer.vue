<template>
  <v-card>
    <!-- Header -->
    <v-toolbar flat dense color="white">
      <v-toolbar-title class="text-h6">Payment Details</v-toolbar-title>
    </v-toolbar>

    <v-container>
      <v-row>
        <!-- Status & Net Paid -->
        <v-col cols="12" md="3">
          <v-chip color="success" dark small>{{ payment.status }}</v-chip>
          <div class="mt-2 font-weight-bold text-h6">₹{{ payment.amount }}</div>

          <div class="mt-1">
            Refunded - ₹{{ totalRefunded }}
            <v-btn small rounded depressed text @click="activeTab = 'refunds'"
              >view</v-btn
            >
          </div>
          <div>
            Credit Note - ₹{{ totalCreditNotes }}
            <v-btn
              small
              rounded
              depressed
              text
              @click="activeTab = 'credit_notes'"
              >view</v-btn
            >
          </div>

          <v-sheet color="green lighten-4" class="pa-2 mt-4 text-center">
            <div class="caption">Net Paid</div>
            <div class="text-h6 font-weight-bold">₹{{ netPaid }}</div>
          </v-sheet>
        </v-col>

        <!-- Overview Details -->
        <v-col cols="12" md="9">
          <v-tabs v-model="activeTab" background-color="transparent" grow>
            <v-tab>Overview</v-tab>
            <v-tab>Refunds</v-tab>
            <v-tab>Credit Notes</v-tab>
          </v-tabs>

          <v-tabs-items v-model="activeTab">
            <v-tab-item>
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title
                      ><strong>Payment ID:</strong>
                      {{ payment.provider_payment_id }}</v-list-item-title
                    >
                    <v-list-item-subtitle
                      ><strong>Order ID:</strong>
                      {{ payment.order_id }}</v-list-item-subtitle
                    >
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <div>
                      <strong>Amount Paid:</strong> ₹{{ payment.amount }}
                    </div>
                    <div>
                      <strong>Mode:</strong> {{ payment.method.toUpperCase() }}
                    </div>
                    <div><strong>Status:</strong> {{ payment.status }}</div>
                    <div>
                      <strong>Date:</strong>
                      {{ formatDate(payment.created_at) }}
                    </div>
                    <div>
                      <strong>Refunded Amount:</strong> ₹{{ totalRefunded }}
                    </div>
                    <div>
                      <strong>Gateway Ref:</strong>
                      {{ payment.vpa || payment.contact || "—" }}
                    </div>
                    <div>
                      <strong>Fee:</strong> ₹{{ parseFloat(payment.fee) / 100 }}
                    </div>
                    <div>
                      <strong>Note:</strong> Paid via
                      {{ payment.method.toUpperCase() }}
                    </div>
                    <div>
                      <strong>Receipt Link:</strong>
                      <a
                        :href="
                          'https://yourdomain.com/receipts/' +
                          payment.provider_payment_id
                        "
                        target="_blank"
                      >
                        View Receipt
                      </a>
                    </div>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-tab-item>

            <v-tab-item>
              <v-data-table
                :headers="refundHeaders"
                :items="payment.refund_data"
                dense
                class="elevation-1"
              >
                <template v-slot:[`item.amount`]="{ item }">
                  ₹{{ item.amount }}
                </template>
                <template v-slot:[`item.created_at`]="{ item }">
                  {{ formatDate(item.created_at) }}
                </template>
              </v-data-table>
            </v-tab-item>

            <v-tab-item>
              <v-data-table
                :headers="creditNoteHeaders"
                :items="payment.credit_note_data"
                dense
                class="elevation-1"
              >
                <template v-slot:no-data> No credit notes issued. </template>
              </v-data-table>
            </v-tab-item>
          </v-tabs-items>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
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
      refundHeaders: [
        { text: "Refund ID", value: "internal_refund_id" },
        { text: "Gateway", value: "gateway_provider" },
        { text: "Amount", value: "amount" },
        { text: "Reason", value: "reason" },
        { text: "Status", value: "status" },
        { text: "Date", value: "created_at" },
      ],
      creditNoteHeaders: [
        { text: "Note ID", value: "credit_note_id" },
        { text: "Amount", value: "original_amount" },
        { text: "Used", value: "used_amount" },
        { text: "Status", value: "status" },
        { text: "Issued On", value: "issued_on" },
      ],
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
