<template>
  <v-card flat class="mt-4 pa-4">
    <!-- Customer Section -->
    <h3 class="mb-2">Customer Details</h3>
    <div>
      <strong>{{ order.customer_data?.display_name }}</strong>
      <div>Phone: {{ order.customer_data?.user_data?.phone }}</div>
      <div>Email: {{ order.customer_data?.email }}</div>
      <div>Status: {{ order.customer_data?.status }}</div>
      <div>
        Verification:
        {{ order.customer_data?.verification_status }}
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "OverviewTab",
  props: ["order"],
};
</script>
