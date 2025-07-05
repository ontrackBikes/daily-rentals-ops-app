<template>
  <v-app>
    <v-container>
      <v-card class="pa-4">
        <v-row>
          <v-col cols="8">
            <div class="mt-2">Order Balance: ₹{{ order?.order_balance }}</div>
            <div class="">Status: {{ order?.order_status }}</div>
            <div class="">Status: {{ order?.order_status }}</div>
          </v-col>
        </v-row>
      </v-card>

      <v-alert
        v-if="order?.order_balance > 0"
        outlined
        type="warning"
        prominent
        border="left"
        class="my-4"
      >
        The payment is still pending for this order, you can add the payment or
        send a link to collect the payment.
        <v-btn
          :to="`/orders/${$route.params.id}/payments`"
          color="primary"
          class="ml-4"
          depressed
          >Add Payment</v-btn
        >
      </v-alert>

      <!-- Tabs -->
      <v-tabs v-model="tab" background-color="transparent" grow>
        <v-tab :to="`/orders/${$route.params.id}`">Overview</v-tab>
        <v-tab :to="`/orders/${$route.params.id}/payments`">Payments</v-tab>
        <v-tab :to="`/orders/${$route.params.id}/bookings`">Bookings</v-tab>
      </v-tabs>

      <!-- Router View -->
      <router-view :order="order" />
    </v-container>
  </v-app>
</template>

<script>
import api from "@/plugins/axios";
export default {
  name: "OrderView",
  data() {
    return {
      order: null,
      tab: null,
    };
  },
  async created() {
    const orderId = this.$route.params.id;
    try {
      const res = await api.get(`/api/order/${orderId}`);
      this.order = res.data.data;
    } catch (e) {
      console.error("Failed to load order", e);
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
  },
};
</script>
