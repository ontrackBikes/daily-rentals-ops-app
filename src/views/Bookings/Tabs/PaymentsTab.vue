<template>
  <v-container>
    <v-card outlined class="rounded-lg">
      <v-skeleton-loader
        v-if="loading"
        type="table-thead, table-row@6"
        class="mx-2 my-4"
      />
      <v-simple-table v-else>
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
    booking: Object,
  },
  data() {
    return {
      payments: [],
      loading: false,
    };
  },
  mounted() {
    this.loadPayments();
  },
  methods: {
    async loadPayments() {
      this.loading = true;
      try {
        const { data } = await api.get(
          `/api/bookings/${this.booking.booking_id}/payments`
        );
        this.payments = data.payments || [];
      } catch (error) {
        console.error("Failed to load payments:", error);
        this.payments = [];
      }
      this.loading = false;
    },
  },
};
</script>
