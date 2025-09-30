<template>
  <deep-layout>
    <v-container fluid>
      <v-row>
        <!-- LEFT: Order Summary -->
        <v-col cols="12" md="3">
          <v-card outlined class="pa-4 rounded-lg">
            <div class="d-flex justify-space-between mb-2">
              <div class="text-subtitle-1 font-weight-bold">
                {{ order?.internal_order_id }}
              </div>

              <!-- Status Chip -->
              <v-chip
                small
                class="font-weight-medium"
                :color="statusColor"
                text-color="white"
              >
                {{ order?.order_status || "N/A" }}
              </v-chip>
            </div>

            <div class="d-flex">
              Paid Total:
              <strong class="ml-2">₹{{ order?.amount_received }}</strong>
            </div>

            <!-- Order Balance -->
            <div class="text-body-2">Order Balance</div>
            <div class="mb-1 font-weight-bold">
              ₹{{ order?.order_balance || 0 }}
            </div>

            <!-- Payment Status -->
            <div class="text-body-2">Payment Status</div>

            <v-chip
              small
              text-color="white"
              class="font-weight-medium"
              :color="getStatusColor(order?.payment_status, 'payment_status')"
            >
              {{ order?.payment_status || "N/A" }}
            </v-chip>
          </v-card>

          <v-card outlined class="pa-4 rounded-lg my-2">
            <!-- Order Total -->
            <div class="text-body-2">Order Total</div>
            <div class="mb-1 font-weight-bold">
              ₹{{ order?.order_total || 0 }}
            </div>
          </v-card>

          <v-card outlined class="pa-4 rounded-lg">
            <CustomerViewer
              v-if="selectedCustomer"
              :customer="selectedCustomer"
            />
          </v-card>
        </v-col>

        <!-- RIGHT: Tabs + Content -->
        <v-col md="9">
          <!-- Pending Payment Alert -->
          <v-alert
            v-if="order?.order_balance > 0"
            outlined
            type="warning"
            prominent
            border="left"
          >
            <div class="text-body-2">
              The payment is still pending for this order. You can add the
              payment or send a link to collect the payment.
            </div>
            <v-btn
              :to="`/orders/${$route.params.id}/payments`"
              color="primary"
              depressed
              class="mt-2"
            >
              Add Payment
            </v-btn>
          </v-alert>

          <!-- Navigation Tabs -->
          <v-tabs v-model="tab" background-color="transparent">
            <!-- <v-tab :to="`/orders/${$route.params.id}`">Overview</v-tab> -->
            <v-tab :to="`/orders/${$route.params.id}/bookings`">Bookings</v-tab>
            <v-tab :to="`/orders/${$route.params.id}/payments`">Payments</v-tab>
            <v-tab :to="`/orders/${$route.params.id}/payments-links`"
              >Payments Links</v-tab
            >
          </v-tabs>

          <!-- Nested View -->
          <router-view :refresh-order="getOrderData" ref="routerView" />
        </v-col>
      </v-row>
    </v-container>
  </deep-layout>
</template>

<script>
import api from "@/plugins/axios";
import DeepLayout from "@/Layouts/DeepLayout.vue";
import CustomerViewer from "@/components/CustomerViewer.vue";
import StatusService from "@/plugins/statusColor";

export default {
  components: { DeepLayout, CustomerViewer },
  name: "OrderView",
  data() {
    return {
      orderId: null,
      order: [],
      tab: null,
      selectedCustomer: null,
    };
  },
  computed: {
    statusColor() {
      const status = this.order?.order_status;
      switch (status) {
        case "created":
          return "blue";
        case "in_progress":
          return "orange";
        case "completed":
          return "green";
        case "cancelled":
          return "red";
        default:
          return "grey";
      }
    },
  },
  async created() {
    this.orderId = this.$route.params.id;
    this.getOrderData();
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.routerView && this.$refs.routerView.$on) {
        this.$refs.routerView.$on("refund-success", this.getOrderData);
        this.$refs.routerView.$on("payment-success", this.getOrderData);
      }
    });
  },
  beforeDestroy() {
    if (this.$refs.routerView && this.$refs.routerView.$off) {
      this.$refs.routerView.$off("refund-success", this.getOrderData);
      this.$refs.routerView.$on("payment-success", this.getOrderData);
    }
  },
  methods: {
    async getOrderData() {
      try {
        const res = await api.get(`/api/order/${this.orderId}`);
        this.order = res.data.data;
        this.selectedCustomer = res.data?.data?.customer_data;
      } catch (e) {
        console.error("Failed to load order", e);
      }
    },

    getStatusColor(status, type) {
      return StatusService.getColor(status, type);
    },
  },
};
</script>
