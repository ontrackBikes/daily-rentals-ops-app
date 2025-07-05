<template>
  <v-card flat class="mt-4 pa-4">
    <h3 class="mb-4">Bookings</h3>

    <v-data-table
      :headers="headers"
      :items="bookings"
      :loading="loading"
      disable-pagination
      hide-default-footer
      class="elevation-1"
    >
      <!-- Regn No -->
      <template v-slot:[`item.registration_number`]="{ item }">
        <VehicleViewer :vehicle="item.vehicle_data">
          {{ item.vehicle_data?.registration_number || "-" }}
        </VehicleViewer>

        <!-- {{ item.vehicle_data?.registration_number || "-" }} -->
      </template>

      <!-- Model -->
      <template v-slot:[`item.model_data`]="{ item }">
        <ModelViewer :model="item.model_data">{{
          item.model_data.model_name || "-"
        }}</ModelViewer>
      </template>

      <!-- Customer -->
      <template v-slot:[`item.customer`]="{ item }">
        {{ item.customer_data?.display_name || "-" }}
      </template>

      <!-- Source -->
      <template v-slot:[`item.source_type`]="{ item }">
        {{ item.source_type || "-" }}
      </template>

      <!-- Actions -->
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn text small color="primary" @click="$emit('view', item)">
          View
        </v-btn>
      </template>
    </v-data-table>

    <!-- Load More -->
    <div class="text-center mt-4">
      <v-btn
        v-if="hasMore"
        :loading="loading"
        color="primary"
        text
        @click="fetchBookings"
      >
        Load More
      </v-btn>
    </div>
  </v-card>
</template>

<script>
import ModelViewer from "@/components/ModelViewer.vue";
import VehicleViewer from "@/components/VehicleViewer.vue";
import api from "@/plugins/axios";

export default {
  name: "BookingsTab",
  data() {
    return {
      bookings: [],
      total: 0,
      limit: 10,
      offset: 0,
      loading: false,
      headers: [
        { text: "Booking Id", value: "internal_booking_id" },
        { text: "Regn No", value: "registration_number" },
        { text: "Model", value: "model_data" },
        { text: "Customer", value: "customer" },
        { text: "Source", value: "source_type" },
        { text: "Action", value: "actions", sortable: false },
      ],
    };
  },
  components: {
    VehicleViewer,
    ModelViewer,
  },

  computed: {
    orderId() {
      return this.$route.params.id;
    },
    hasMore() {
      return this.bookings.length < this.total;
    },
  },
  methods: {
    async fetchBookings() {
      this.loading = true;
      try {
        const res = await api.get(`/api/order/${this.orderId}/bookings`, {
          params: {
            limit: this.limit,
            offset: this.offset,
          },
        });
        const data = res.data.data;
        this.bookings.push(...data.bookings);
        this.total = data.meta.total;
        this.offset += this.limit;
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.fetchBookings();
  },
};
</script>
