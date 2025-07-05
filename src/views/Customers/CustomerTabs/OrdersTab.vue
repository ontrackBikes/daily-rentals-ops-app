<template>
  <v-container>
    <v-card class="rounded-lg my-4" outlined>
      <!-- Loading Skeleton -->
      <v-skeleton-loader
        v-if="loading"
        type="table"
        class="mx-4 mt-4"
        :loading="loading"
      ></v-skeleton-loader>

      <!-- Table when not loading -->
      <div v-else>
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">Order ID</th>
              <th class="text-left">Order Balance</th>
              <th class="text-left">Payment Status</th>
              <th class="text-left">Source</th>
              <th class="text-left">Created At</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ order.order_id }}</td>
              <td>{{ order.order_balance }}</td>
              <td>
                <v-chip
                  :color="getStatusColor(order.payment_status)"
                  text-color="white"
                  small
                >
                  {{ order.status }}
                </v-chip>
              </td>
              <td>{{ order.source }}</td>
              <td>{{ order.created_at | moment }}</td>
              <td>
                <v-btn
                  small
                  outlined
                  color="primary"
                  @click="viewOrder(order.order_id)"
                >
                  View
                </v-btn>
              </td>
            </tr>
            <tr v-if="!orders.length">
              <td colspan="6" class="text-center grey--text">
                No orders found.
              </td>
            </tr>
          </tbody>
        </v-simple-table>

        <v-divider></v-divider>

        <!-- Pagination -->
        <v-card-actions class="justify-center">
          <v-pagination
            v-model="page"
            :length="pageCount"
            circle
            total-visible="5"
            @input="fetchorders"
          />
        </v-card-actions>
      </div>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      page: 1,
      pageCount: 1,
      orders: [
        {
          id: 1,
          order_id: "ORD123456",
          order_balance: "₹1,200",
          payment_status: "paid",
          status: "Paid",
          source: "Website",
          created_at: "2025-07-01T10:00:00Z",
        },
        {
          id: 2,
          order_id: "ORD123457",
          order_balance: "₹500",
          payment_status: "pending",
          status: "Pending",
          source: "Mobile App",
          created_at: "2025-07-03T15:30:00Z",
        },
        {
          id: 3,
          order_id: "ORD123458",
          order_balance: "₹0",
          payment_status: "failed",
          status: "Failed",
          source: "Admin Panel",
          created_at: "2025-07-02T08:45:00Z",
        },
      ],
    };
  },
  methods: {
    viewOrder(orderId) {
      console.log("View order clicked:", orderId);
      // You can route to order detail page here if needed
    },
    getStatusColor(status) {
      switch (status.toLowerCase()) {
        case "paid":
          return "green";
        case "pending":
          return "orange";
        case "failed":
          return "red";
        default:
          return "grey";
      }
    },
    fetchorders() {
      // Placeholder for future API call
      console.log("Fetching orders for page:", this.page);
    },
  },
};
</script>

<style scoped></style>
