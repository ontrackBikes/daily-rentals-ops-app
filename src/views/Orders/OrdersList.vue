<template>
  <v-container>
    <v-row align="center" class="mb-4">
      <!-- Title -->
      <v-col cols="12" md="2" class="d-flex align-center">
        <div class="text-h6 font-weight-bold">Orders ({{ total }})</div>
      </v-col>

      <!-- Search Field -->
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          append-icon="mdi-magnify"
          placeholder="Search by Order ID..."
          dense
          outlined
          hide-details
          @input="onSearchInput"
          @keyup.enter="fetchOrders"
        />
      </v-col>

      <!-- Filter & Sort -->
      <v-col cols="12" md="6" class="d-flex align-center justify-end">
        <v-select
          v-model="selectedBalanceFilter"
          :items="orderBalanceOptions"
          label="Order Balance"
          outlined
          dense
          hide-details
          class="mr-2"
          @change="fetchOrders"
        />
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          label="Sort By"
          outlined
          dense
          hide-details
          class="mr-2"
          @change="fetchOrders"
        />

        <v-btn color="primary" dark to="/create-booking">
          <v-icon left>mdi-plus</v-icon>
          Add Order
        </v-btn>
      </v-col>
    </v-row>

    <v-card class="rounded-lg my-4" outlined :loading="loading">
      <v-simple-table>
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
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.internal_order_id }}</td>

            <td>
              {{ order.order_balance }}
            </td>

            <td>{{ order.payment_status }}</td>

            <td>{{ order.customer_data?.display_name || "N/A" }}</td>

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
            <td colspan="6" class="text-center grey--text">No orders found.</td>
          </tr>
        </tbody>
      </v-simple-table>

      <v-divider></v-divider>
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
import debounce from "lodash/debounce";

export default {
  name: "OrderList",
  data() {
    return {
      loading: false,
      orders: [],
      total: 0,
      page: 1,
      limit: 10,
      pageCount: 1,
      searchQuery: "",
      selectedBalanceFilter: "",
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
      const offset = (this.page - 1) * this.limit;

      try {
        const { data } = await api.get("/api/orders", {
          params: {
            limit: this.limit,
            offset,
            order_balance: this.selectedBalanceFilter || undefined,
            sort_by: this.sortBy || undefined,
            search: this.searchQuery || undefined,
          },
        });

        this.orders = data?.data?.orders || [];
        this.total = data?.data?.metadata?.total || 0;
        this.pageCount = Math.ceil(this.total / this.limit) || 1;
      } catch (err) {
        console.error("Order fetch error:", err);
      } finally {
        this.loading = false;
      }
    },

    viewOrder(id) {
      this.$router.push(`/orders/${id}`);
    },

    getBalanceColor(balance) {
      if (balance > 0) return "orange";
      if (balance < 0) return "red";
      return "green";
    },

    getBalanceLabel(balance) {
      if (balance > 0) return "Collect Pending";
      if (balance < 0) return "Refund Due";
      return "Settled";
    },
  },
};
</script>
