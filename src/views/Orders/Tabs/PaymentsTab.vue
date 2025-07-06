<template>
  <v-container>
    <div class="d-flex justify-end my-2">
      <v-btn color="primary" @click="openAddPaymentDialog">Add Payment</v-btn>
    </div>
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
      loading: false,
    };
  },
  mounted() {
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
  },
};
</script>
