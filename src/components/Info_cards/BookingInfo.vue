<template>
  <v-card class="pa-4 rounded-lg elevation-3" outlined>
    <v-overlay :value="loading" absolute>
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>

    <!-- Expand Button -->
    <div class="d-flex justify-end">
      <v-btn
        small
        color="primary"
        dark
        class="text-capitalize"
        @click.stop="goToBookingView(booking.booking_id)"
        v-if="booking"
      >
        <v-icon small class="mr-1">mdi-open-in-new</v-icon> Expand
      </v-btn>
    </div>

    <!-- Model & Amount -->
    <div class="mb-2" v-if="booking">
      <div class="text-subtitle-1 font-weight-bold">
        {{ booking?.vehicle_data?.model_data?.model_name || "Model Name" }}
      </div>
      <div class="text-body-2 grey--text">
        ₹{{ booking?.net_amount || "0.00" }}
      </div>
    </div>

    <!-- Location -->
    <div class="text-caption mb-2" v-if="booking">
      Pickup Location ({{ booking?.vehicle_data?.location_data?.name }})<br />
      {{ booking?.vehicle_data?.location_data?.address }}
    </div>

    <!-- Dates -->
    <div
      class="d-flex justify-space-between text-caption font-weight-medium my-2"
      v-if="booking"
    >
      <div>
        Start Date<br />
        <strong>{{ formatDate(booking.start_date) }}</strong>
      </div>
      <div>
        End Date<br />
        <strong>{{ formatDate(booking.end_date) }}</strong>
      </div>
    </div>

    <v-divider class="my-2" v-if="booking" />

    <!-- Pricing Details -->
    <div v-if="booking?.booking_line_item_data?.length">
      <div class="text-subtitle-2 font-weight-bold mb-2">Pricing Details</div>
      <div
        v-for="(data, index) in booking.booking_line_item_data"
        :key="index"
        class="d-flex justify-space-between mb-1"
      >
        <span>{{ data.product_name }} × {{ data.quantity }}</span>
        <strong>
          ₹{{ data.net_total }}
          <del v-if="parseFloat(data.gross_total) > parseFloat(data.net_total)">
            ₹{{ data.gross_total }}
          </del>
        </strong>
      </div>
    </div>

    <v-divider class="my-2" v-if="booking" />

    <!-- Amount Summary -->
    <div class="text-body-2" v-if="booking">
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
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "BookingViewer",
  props: {
    bookingId: {
      type: [String, Number],
      required: false,
    },
    bookingData: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      booking: this.bookingData || null,
      loading: false,
    };
  },
  watch: {
    bookingId: {
      immediate: true,
      handler(newVal) {
        if (newVal && !this.bookingData) {
          this.fetchBookingData(newVal);
        }
      },
    },
  },
  methods: {
    goToBookingView(id) {
      const url = `/booking/${id}`;
      window.open(url, "_blank");
    },
    async fetchBookingData(id) {
      try {
        this.loading = true;
        const { data } = await api.get(`/api/booking/${id}`);
        this.booking = data.data;
      } catch (err) {
        console.error("Failed to fetch booking:", err.message);
      } finally {
        this.loading = false;
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
