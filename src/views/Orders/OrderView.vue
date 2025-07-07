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

            <!-- Date Range -->
            <!-- <div class="text-subtitle-2 mb-1">
              {{ order.booking_data?.[0]?.start_date | moment("DD/MM/YYYY") }} -
              {{ order.booking_data?.[0]?.end_date | moment("DD/MM/YYYY") }}
            </div> -->

            <!-- Reg. Number -->
            <!-- <div class="font-weight-bold mb-1">
              {{
                order?.booking_data?.[0]?.vehicle_data?.registration_number ||
                "N/A"
              }}
            </div> -->

            <!-- Order Balance -->
            <div class="text-body-2">Order Balance</div>
            <div class="mb-1 font-weight-bold">
              ₹{{ order?.order_balance || 0 }}
            </div>

            <!-- Payment Status -->
            <div class="text-body-2">Payment Status</div>
            <div class="font-weight-bold">
              {{ order?.payment_status || "N/A" }}
            </div>
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
          </v-tabs>

          <!-- Nested View -->
          <router-view :order="order" />
        </v-col>
      </v-row>
    </v-container>
  </deep-layout>
</template>

<script>
import api from "@/plugins/axios";
import DeepLayout from "@/Layouts/DeepLayout.vue";
import CustomerViewer from "@/components/CustomerViewer.vue";

export default {
  components: { DeepLayout, CustomerViewer },
  name: "OrderView",
  data() {
    return {
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
    const orderId = this.$route.params.id;
    try {
      const res = await api.get(`/api/order/${orderId}`);
      this.order = res.data.data;
      this.selectedCustomer = res.data?.data?.customer_data;
    } catch (e) {
      console.error("Failed to load order", e);
    }
  },
};
</script>
