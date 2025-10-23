<template>
  <v-container>
    <!-- Header Row -->
    <v-row align="center" class="mb-4">
      <!-- Title -->
      <v-col cols="12" md="2" class="d-flex align-center">
        <div class="text-h6 font-weight-bold">Orders ({{ total }})</div>
      </v-col>

      <!-- Search -->
      <v-col cols="12" md="5">
        <v-text-field
          v-model="searchQuery"
          append-icon="mdi-magnify"
          placeholder="Search by Order ID..."
          dense
          outlined
          hide-details
          @keyup.enter="fetchOrders"
          class="rounded-lg"
        />
      </v-col>

      <!-- Filters -->
      <v-col cols="12" md="5" class="d-flex align-center justify-end">
        <v-select
          v-model="selectedBalanceFilter"
          :items="orderBalanceOptions"
          label="Order Balance"
          outlined
          dense
          hide-details
          class="mr-2 rounded-lg"
          @change="fetchOrders"
        />
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          label="Sort By"
          outlined
          dense
          hide-details
          class="mr-2 rounded-lg"
          @change="fetchOrders"
        />
        <v-select
          v-model="paymentStatusFilter"
          :items="paymentStatusOptions"
          label="Payment Status"
          outlined
          dense
          hide-details
          class="rounded-lg"
          @change="fetchOrders"
        />
      </v-col>
    </v-row>

    <!-- Orders Card -->
    <v-card class="rounded-lg my-4 elevation-2" outlined>
      <!-- Skeleton Loader -->
      <v-skeleton-loader
        v-if="loading"
        type="table-thead, table-row@6"
        class="mx-2 my-4"
      />

      <!-- Table -->
      <v-simple-table v-else>
        <thead>
          <tr>
            <th class="text-left">Order ID</th>
            <th class="text-left">Order Balance</th>
            <th class="text-left">Payment Status</th>
            <th class="text-left">Customer</th>
            <th class="text-left">Created At</th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="order in visibleOrders"
            :key="order.id"
            v-intersect="loading"
          >
            <td>
              <dialog-layout>
                {{ order.internal_order_id || "N/A" }}
                <template #title>View Order</template>
                <template #content>
                  <order-info :order="order" />
                </template>
              </dialog-layout>
            </td>

            <td>{{ order.order_balance }}</td>

            <td>
              <v-chip
                :color="getStatusColor(order.payment_status, 'payment_status')"
                small
              >
                {{ order.payment_status }}
              </v-chip>
            </td>

            <td>
              <dialog-layout>
                {{ order.customer_data?.display_name || "N/A" }}
                <template #title>View Customer</template>
                <template #content>
                  <customer-info
                    :customerId="order.customer_data.customer_id"
                  />
                </template>
              </dialog-layout>
            </td>

            <td>{{ order.created_at | moment }}</td>

            <td>
              <v-btn
                small
                outlined
                color="primary"
                rounded
                @click="viewOrder(order.order_id)"
              >
                View
              </v-btn>
            </td>
          </tr>

          <tr v-if="!orders.length && !loading">
            <td colspan="6" class="text-center grey--text py-4">
              No orders found.
            </td>
          </tr>
        </tbody>
      </v-simple-table>

      <!-- Pagination -->
      <v-divider />
      <v-card-actions class="justify-center">
        <v-pagination
          v-model="page"
          :length="pageCount"
          circle
          total-visible="5"
          @input="fetchOrders"
        />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import api from "@/plugins/axios";
import StatusService from "@/plugins/statusColor";
import debounce from "lodash/debounce";
import CustomerInfo from "@/components/Info_cards/CustomerInfo.vue";
import OrderInfo from "@/components/Info_cards/OrderInfo.vue";
import DialogLayout from "@/components/popup_layouts/DialogLayout.vue";

export default {
  name: "OrderList",
  components: { CustomerInfo, OrderInfo, DialogLayout },

  data() {
    return {
      loading: false,

      orders: [],
      visibleOrders: [],
      total: 0,
      page: 1,
      limit: 10,
      pageCount: 1,
      searchQuery: "",
      selectedBalanceFilter: "",
      paymentStatusFilter: "paid",
      paymentStatusOptions: [
        { text: "All", value: "" },
        { text: "Paid", value: "paid" },
        { text: "Pending", value: "pending" },
        { text: "Partially Paid", value: "partial_paid" },
        { text: "Over Paid", value: "over_paid" },
      ],
      sortBy: "",
      orderBalanceOptions: [
        { text: "All", value: "" },
        { text: "Settled", value: "settled" },
        { text: "Collect Pending", value: "collect_pending" },
        { text: "Refund Due", value: "refund_due" },
      ],
      sortOptions: [
        { text: "Default", value: "" },
        { text: "Order Balance", value: "order_balance" },
      ],
      lazyLimit: 10, // Number of rows to display at once (for lazy loading)
    };
  },

  watch: {
    searchQuery: {
      handler: "onSearchInput",
    },
  },

  created() {
    this.onSearchInput = debounce(this.fetchOrders, 400);
  },

  mounted() {
    this.fetchOrders();
  },

  methods: {
    async fetchOrders() {
      this.loading = true;
      this.loadError = null;
      const offset = (this.page - 1) * this.limit;

      try {
        const { data } = await api.get("/api/orders", {
          params: {
            limit: this.limit,
            offset,
            order_balance: this.selectedBalanceFilter || undefined,
            sort_by: this.sortBy || undefined,
            payment_status: this.paymentStatusFilter || undefined,
            search: this.searchQuery || undefined,
          },
        });

        this.orders = data?.data?.orders || [];
        this.visibleOrders = this.orders.slice(0, this.lazyLimit);
        this.total = data?.data?.metadata?.total || 0;
        this.pageCount = Math.ceil(this.total / this.limit) || 1;
      } catch (err) {
        console.error("Order fetch error:", err);
        this.loadError =
          "Failed to fetch orders. Please check your connection and retry.";
      } finally {
        this.loading = false;
      }
    },

    viewOrder(id) {
      this.$router.push(`/orders/${id}`);
    },

    getStatusColor(status, type) {
      return StatusService.getColor(status, type);
    },
  },
};
</script>

<style scoped>
.v-skeleton-loader {
  border-radius: 12px;
}
</style>
