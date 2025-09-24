<template>
  <v-container>
    <v-card class="rounded-lg my-4" outlined>
      <!-- Loading Skeleton -->
      <v-skeleton-loader
        v-if="loading"
        type="table"
        class="mx-4 mt-4"
        :loading="loading"
      />

      <!-- Table -->
      <div v-else>
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">Order ID</th>
              <th class="text-left">Order Balance</th>
              <th class="text-left">Payment Status</th>
              <th class="text-left">Order Status</th>
              <th class="text-left">Created At</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.order_id">
              <td>{{ order.internal_order_id }}</td>
              <td>₹{{ order.order_balance }}</td>
              <td>
                <v-chip
                  :color="
                    getStatusColor(order.payment_status, 'payment_status')
                  "
                  dark
                  small
                >
                  {{ order.payment_status }}
                </v-chip>
              </td>
              <td>{{ order.order_status }}</td>
              <td>{{ formatDate(order.created_at) }}</td>
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
            @input="fetchOrders"
          />
        </v-card-actions>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import api from "@/plugins/axios";
import StatusService from "@/plugins/statusColor";
export default {
  data() {
    return {
      loading: false,
      page: 1,
      pageCount: 1,
      limit: 5, // limit per page
      orders: [],
    };
  },
  mounted() {
    this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      try {
        this.loading = true;
        const offset = (this.page - 1) * this.limit;
        const customerId = this.$route.params.customer_id;

        const res = await api.get(`/api/customer/${customerId}/orders`, {
          params: {
            limit: this.limit,
            offset,
            // Optional filter example:
            // order_balance: "settled"
          },
        });

        if (res.data.success) {
          this.orders = res.data.data.orders;
          const total = res.data.data.metadata.total;
          this.pageCount = Math.ceil(total / this.limit);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        this.loading = false;
      }
    },
    viewOrder(orderId) {
      this.$router.push(`/orders/${orderId}/bookings`);
    },

    getStatusColor(status, type) {
      return StatusService.getColor(status, type);
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>
