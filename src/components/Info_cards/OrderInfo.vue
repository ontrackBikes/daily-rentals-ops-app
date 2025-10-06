<template>
  <v-card outlined class="pa-4" :loading="loading">
    <v-overlay :value="loading" absolute>
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>

    <!-- Header -->
    <div v-if="localOrder">
      <div class="d-flex align-center justify-space-between">
        <v-chip
          :color="statusColor(localOrder.order_status)"
          small
          text-color="white"
          class="mb-1"
        >
          {{ localOrder.order_status }}
        </v-chip>

        <v-btn
          small
          color="primary"
          dark
          depressed
          rounded
          class="my-auto"
          :to="`/orders/${localOrder.order_id}`"
          target="_blank"
        >
          <v-icon small class="mr-1">mdi-open-in-new</v-icon> Expand
        </v-btn>
      </div>
      <div class="my-auto">
        <div class="text-h6 font-weight-bold">
          Order #{{ localOrder.internal_order_id }}
        </div>
        <div class="text-caption grey--text">
          Created on {{ formatDate(localOrder.created_at) }}
        </div>
      </div>
    </div>

    <!-- Customer Info -->
    <!-- <div class="text-subtitle-1 font-weight-medium my-2">Customer Info</div> -->
    <v-card outlined class="pa-4 my-2 rounded-lg" v-if="order">
      <dialog-layout :maxWidth="600">
        {{ localOrder.customer_data.display_name || "N/A" }}
        <template #title> View Customer </template>
        <template #content>
          <customer-info :customer="localOrder.customer_data" />
        </template>
      </dialog-layout>

      <div class="text-subtitle-2">
        Phone:
        <span class="font-weight-bold"
          >{{ localOrder.customer_data.user_data.phone || "N/A" }}
        </span>
      </div>
      <div class="text-subtitle-2">
        Email:
        <span class="font-weight-bold">{{
          localOrder.customer_data.email || "N/A"
        }}</span>
      </div>
    </v-card>

    <!-- Payment Info -->
    <!-- <div class="text-subtitle-1 font-weight-medium my-2">Payment Summary</div> -->
    <v-card outlined class="pa-4 my-2 rounded-lg">
      <div class="d-flex justify-space-between align-center">
        <div class="text-subtitle-2">Payment Status</div>
        <div class="font-weight-bold text-capitalize">
          {{ localOrder.payment_status }}
        </div>
      </div>
      <div class="d-flex justify-space-between align-center my-2">
        <div class="text-subtitle-2">Total Amount</div>
        <div class="font-weight-bold">₹{{ localOrder.order_total }}</div>
      </div>
      <div class="d-flex justify-space-between align-center">
        <div class="text-subtitle-2">Order Balance</div>
        <div class="font-weight-bold">₹{{ localOrder.order_balance }}</div>
      </div>
    </v-card>

    <!-- Booking Info -->
    <div v-if="localOrder?.booking_data?.length">
      <!-- <div class="text-subtitle-1 font-weight-medium my-2">Booking Details</div> -->

      <v-card
        outlined
        v-for="(data, index) in localOrder.booking_data"
        :key="index"
        class="my-2 pa-4 rounded-lg"
      >
        <v-row no-gutters>
          <!-- Vehicle Image -->
          <v-col cols="12" sm="4" class="d-flex align-center justify-center">
            <v-img
              :src="
                data.vehicle_data.model_data?.image_url ||
                'https://via.placeholder.com/150'
              "
              height="120"
              class="rounded-l-lg"
              contain
            />
          </v-col>

          <!-- Booking Info -->
          <v-col cols="12" sm="8" class="pa-3">
            <div class="d-flex justify-space-between align-center mb-1">
              <div class="font-weight-medium text-subtitle-2">
                {{ data.vehicle_data.model_data.model_name }}
              </div>
              <v-chip
                x-small
                :color="statusColor(data.status)"
                text-color="white"
              >
                {{ data.status }}
              </v-chip>
            </div>

            <div class="text-caption grey--text mb-1">
              Reg. No: {{ data.vehicle_data.registration_number }}
            </div>

            <div class="text-caption">
              Duration:
              <span class="font-weight-medium">
                {{ formatDate(data.start_date) }} –
                {{ formatDate(data.end_date) }}
              </span>
            </div>

            <div class="text-caption mt-1">
              Pickup: {{ data.vehicle_data.location_data.name }}
            </div>

            <div class="mt-2 font-weight-bold">₹{{ data.net_amount }}</div>

            <dialog-layout :maxWidth="800">
              <template #title>Booking Info</template>
              <template #content>
                <booking-info :bookingId="data.booking_id" />
              </template>
            </dialog-layout>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <!-- Payment Raw (optional) -->
    <div v-if="order?.payment_data?.length">
      <div class="text-subtitle-2 font-weight-bold mt-4">Raw Payment Data</div>
      <pre class="text-caption">{{ localOrder.payment_data }}</pre>
    </div>
  </v-card>
</template>

<script>
import DialogLayout from "../popup_layouts/DialogLayout.vue";
import BookingInfo from "./BookingInfo.vue";
import api from "@/plugins/axios";
import CustomerInfo from "./CustomerInfo.vue";

export default {
  components: { DialogLayout, BookingInfo, CustomerInfo },
  name: "OrderInfo",
  props: {
    orderId: {
      type: [Number, String],
      required: false,
    },
    order: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      loading: false,
      localOrder: this.order || null,
    };
  },
  watch: {
    orderId: {
      immediate: true,
      handler(val) {
        if (val && !this.localOrder) {
          this.fetchOrder();
        }
      },
    },
  },
  methods: {
    async fetchOrder() {
      try {
        this.loading = true;
        const { data } = await api.get(`/api/order/${this.orderId}`);
        this.localOrder = data.order || data.data;
      } catch (err) {
        console.error("Failed to fetch order:", err.message);
      } finally {
        this.loading = false;
      }
    },
    statusColor(status) {
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
    formatDate(date) {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
  },
};
</script>

<style scoped>
.text-caption {
  font-size: 13px;
}
</style>
