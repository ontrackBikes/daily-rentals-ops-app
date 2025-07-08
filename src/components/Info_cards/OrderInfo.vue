<template>
  <v-card outlined class="pa-4" :loading="loading">
    <v-overlay :value="loading" absolute>
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>

    <!-- Header -->
    <div
      class="d-flex justify-space-between align-center mb-4"
      v-if="localOrder"
    >
      <div class="my-auto">
        <v-chip
          :color="statusColor(localOrder.order_status)"
          small
          text-color="white"
        >
          {{ localOrder.order_status }}
        </v-chip>
        <div class="text-h6 font-weight-bold">
          Order #{{ localOrder.internal_order_id }}
        </div>
      </div>

      <v-btn
        small
        color="primary"
        dark
        class="my-auto"
        :to="`/orders/${localOrder.order_id}`"
        target="_blank"
      >
        <v-icon small class="mr-1">mdi-open-in-new</v-icon> Expand
      </v-btn>
    </div>

    <!-- Customer Info -->
    <v-card outlined class="pa-4 my-2" v-if="order">
      <dialog-layout :maxWidth="800">
        {{ localOrder.customer_data.display_name }}
        <template #title> View Customer </template>
        <template #content>
          <customer-info :customer="localOrder.customer_data" />
        </template>
      </dialog-layout>

      <div>Ph: {{ localOrder.customer_data.user_data.phone }}</div>
      <div>Email: {{ localOrder.customer_data.email }}</div>
    </v-card>

    <!-- Payment Info -->
    <v-card outlined class="pa-4 my-2">
      <v-row dense class="mb-4" v-if="order">
        <v-col cols="6">
          <div class="text-subtitle-2">Payment Status</div>
          <div class="font-weight-bold">{{ localOrder.payment_status }}</div>
        </v-col>
        <v-col cols="6">
          <div class="text-subtitle-2">Order Total</div>
          <div class="font-weight-bold">₹{{ localOrder.order_total }}</div>
          <div class="text-subtitle-2 mt-2">Balance</div>
          <div class="font-weight-bold">₹{{ localOrder.order_balance }}</div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Booking Info -->
    <div v-if="order?.booking_data?.length" class="mt-2">
      <div class="font-weight-bold text-subtitle-1 mb-2">Bookings</div>

      <v-card
        outlined
        v-for="(data, index) in localOrder.booking_data"
        :key="index"
        class="mb-2"
      >
        <v-row no-gutters>
          <!-- Vehicle Image -->
          <v-col cols="4" class="my-auto">
            <v-img
              :src="data.vehicle_data.image_url"
              height="110"
              class="rounded-l-lg my-auto"
              contain
            />
          </v-col>

          <!-- Booking Details -->
          <v-col cols="8" class="pa-3">
            <dialog-layout :maxWidth="800">
              {{ data.internal_booking_id }}
              <template #title>
                {{ data.internal_booking_id }}
              </template>
              <template #content>
                <booking-info :bookingId="data.booking_id" />
              </template>
            </dialog-layout>

            <div>
              <strong>₹{{ data.net_amount }}</strong>
            </div>
            <div class="font-weight-medium">
              {{ data.vehicle_data.model_data.model_name }}
            </div>
            <div class="text-caption grey--text mb-1">
              {{ data.vehicle_data.registration_number }}
            </div>
            <div class="text-caption">
              {{ formatDate(data.start_date) }} to
              {{ formatDate(data.end_date) }}
            </div>
            <div class="text-caption mt-1">
              {{ data.vehicle_data.location_data.name }},
              {{ data.vehicle_data.location_data.pincode }}
            </div>
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
