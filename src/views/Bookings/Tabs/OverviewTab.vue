<template>
  <div class="pa-4" v-if="booking">
    <!-- Customer Info -->
    <div class="mb-2 d-flex align-center">
      <div class="font-weight-medium">
        {{ booking.order_data?.customer_name || "N/A" }}
      </div>
      <v-icon
        small
        class="ml-1 cursor-pointer"
        @click="goToCustomerOrders"
        title="View customer orders"
      >
        mdi-open-in-new
      </v-icon>
    </div>
    <div>{{ booking.order_data?.customer_email || "N/A" }}</div>
    <div>{{ booking.order_data?.customer_mobile || "N/A" }}</div>

    <!-- Pickup Location -->
    <div class="mt-4">
      <div class="font-weight-bold">Pickup Location</div>
      <div>
        {{
          booking.vehicle_data?.location_data?.name
            ? `Ontrack - ${booking.vehicle_data.location_data.name} – ${booking.vehicle_data.location_data.address}`
            : "N/A"
        }}
      </div>
    </div>

    <!-- Odometer Readings -->
    <div class="mt-4">
      <div class="font-weight-bold">Odometer Readings</div>
      <div>
        pre:
        {{ booking.pre_odo || booking.vehicle_data?.current_km || "N/A" }} KMs
      </div>
      <div>post: {{ booking.post_odo || "-" }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "OverviewTab",
  props: {
    booking: {
      type: Object,
      required: true,
    },
  },
  methods: {
    goToCustomerOrders() {
      const customerId = this.booking.order_data?.customer_id;
      if (customerId) {
        this.$router.push(`/customer/${customerId}/orders`);
      }
    },
  },
};
</script>
