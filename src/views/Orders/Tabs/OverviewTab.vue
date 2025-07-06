<template>
  <v-card flat class="pa-4">
    <!-- Customer Section -->
    <div class="d-flex align-center">
      <strong>{{ order.customer_data?.display_name }}</strong>
      <v-icon
        small
        class="ml-2"
        color="primary"
        style="cursor: pointer"
        @click="goToCustomerView"
      >
        mdi-open-in-new
      </v-icon>
    </div>

    <div>Phone: {{ order.customer_data?.user_data?.phone }}</div>
    <div>Email: {{ order.customer_data?.email }}</div>
    <div>Status: {{ order.customer_data?.status }}</div>
    <div>Verification: {{ order.customer_data?.verification_status }}</div>
  </v-card>
</template>

<script>
export default {
  name: "OverviewTab",
  props: ["order"],
  methods: {
    goToCustomerView() {
      const id = this.order?.customer_data?.customer_id;
      if (id) this.$router.push(`/customer/${id}/orders`);
    },
  },
};
</script>
