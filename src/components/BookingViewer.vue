<template>
  <v-menu v-model="menu" bottom offset-y>
    <template v-slot:activator="{ attrs }">
      <v-btn
        text
        color="primary"
        dark
        v-bind="attrs"
        @click.stop="menu = !menu"
      >
        <slot></slot>
      </v-btn>
    </template>

    <v-card max-width="400" class="pa-4 rounded-lg elevation-3">
      <!-- Header -->
      <div class="d-flex justify-end">
        <v-btn
          small
          color="primary"
          dark
          class="text-capitalize"
          @click.stop="goToBookingView(booking.booking_id)"
        >
          <v-icon small class="mr-1">mdi-open-in-new</v-icon> Expand
        </v-btn>
      </div>
      <div class="mb-2">
        <div class="text-subtitle-1 font-weight-bold">
          {{ booking?.model_data?.model_name || "Model Name" }}
        </div>
        <div class="text-body-2 grey--text">
          ₹{{ booking?.net_amount || "0.00" }}
        </div>
      </div>

      <!-- Location -->
      <div class="text-caption mb-2">
        Pickup Location ({{ booking?.vehicle_data?.location_data?.name }})<br />
        {{ booking?.vehicle_data?.location_data?.address }}
      </div>

      <!-- Dates -->
      <div
        class="d-flex justify-space-between text-caption font-weight-medium my-2"
      >
        <div>
          Start Date<br /><strong>{{
            booking.start_date | moment("DD/MM/YYYY")
          }}</strong>
        </div>
        <div>
          End Date<br /><strong>{{
            booking.end_date | moment("DD/MM/YYYY")
          }}</strong>
        </div>
      </div>

      <v-divider class="my-2" />

      <!-- Pricing Details -->
      <div>
        <div class="text-subtitle-2 font-weight-bold mb-2">Pricing Details</div>
        <div class="d-flex justify-space-between">
          <span>Per day rentals x 3</span>
          <strong>₹{{ perDayRental }}</strong>
        </div>
        <div class="d-flex justify-space-between">
          <span>Helmet ISI Full x 2</span>
          <strong>₹1800.00</strong>
        </div>
      </div>

      <v-divider class="my-2" />

      <!-- Amount Summary -->
      <div class="text-body-2">
        <div class="d-flex justify-space-between">
          <strong>Gross Amount</strong>
          <span>₹{{ booking?.gross_amount || "0.00" }}</span>
        </div>
        <div class="d-flex justify-space-between">
          <span>Discount</span>
          <span>- ₹{{ booking?.discount_amount || "0.00" }}</span>
        </div>
        <div class="d-flex justify-space-between">
          <span>Round Off</span>
          <span>₹{{ booking?.roundoff_amount || "0.00" }}</span>
        </div>
        <div class="d-flex justify-space-between">
          <span>Tax & Fees</span>
          <span>₹{{ booking?.tax_amount || "0.00" }}</span>
        </div>
        <v-divider class="my-2" />
        <div
          class="d-flex justify-space-between text-subtitle-1 font-weight-bold"
        >
          <span>Net Amount</span>
          <span>₹{{ booking?.net_amount || "0.00" }}</span>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  name: "BookingViewer",
  props: {
    booking: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      menu: false,
    };
  },
  computed: {
    perDayRental() {
      // Assuming gross - 1800 for helmet = per day rental (just placeholder logic)
      const gross = parseFloat(this.booking?.gross_amount || 0);
      return (gross - 1800).toFixed(2);
    },
  },
  methods: {
    goToBookingView(id) {
      const url = `/booking/${id}`;
      window.open(url, "_blank");
    },
  },
};
</script>

<style scoped>
.text-caption {
  font-size: 13px;
}
</style>
