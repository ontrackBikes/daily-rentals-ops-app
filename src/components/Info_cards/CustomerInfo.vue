<template>
  <v-card class="pa-4 rounded-lg elevation-2" outlined :loading="loading">
    <!-- Header -->

    <div class="d-flex justify-space-between align-center mb-3">
      <div>
        <div class="text-h6 font-weight-bold">
          {{ localCustomer?.display_name || "Customer" }}
        </div>
        <div class="text-subtitle-2 grey--text">
          Joined: {{ formatDate(localCustomer?.created_at) }}
        </div>
      </div>
    </div>

    <!-- Contact Details -->
    <div class="d-flex align-center mb-2">
      <v-icon small color="primary" class="mr-2">mdi-phone</v-icon>
      <span class="text-subtitle-2 font-weight-bold">
        {{ localCustomer?.user_data?.phone || "N/A" }}
      </span>
    </div>

    <div class="d-flex align-center mb-2">
      <v-icon small color="primary" class="mr-2">mdi-email</v-icon>
      <span class="text-subtitle-2 font-weight-bold">
        {{ localCustomer?.email || "N/A" }}
      </span>
    </div>

    <div class="d-flex align-start">
      <v-icon small color="primary" class="mr-2 mt-1">mdi-home</v-icon>
      <span class="text-subtitle-2 font-weight-bold">
        {{ localCustomer?.address || "No address available" }}
      </span>
    </div>

    <!-- Status Chips -->
    <div class="mt-4">
      <v-chip
        :color="localCustomer?.status === 'active' ? 'green' : 'grey'"
        small
        outlined
        class="mr-2"
      >
        {{ localCustomer?.status || "unknown" }}
      </v-chip>
      <v-chip
        :color="
          localCustomer?.verification_status === 'verified' ? 'blue' : 'orange'
        "
        small
        outlined
      >
        {{ localCustomer?.verification_status || "unverified" }}
      </v-chip>
    </div>
  </v-card>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "CustomerViewer",
  props: {
    customerId: {
      type: [Number, String],
      required: false,
    },
    customer: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      loading: false,
      localCustomer: this.customer || null,
    };
  },
  watch: {
    customerId: {
      immediate: true,
      handler(val) {
        if (val && !this.customerData) {
          this.fetchCustomer();
        }
      },
    },
  },
  methods: {
    async fetchCustomer() {
      try {
        this.loading = true;
        const { data } = await api.get(`/api/customer/${this.customerId}`);
        this.localCustomer = data.customer || data.data;
      } catch (err) {
        console.error("Failed to fetch customer:", err.message);
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      if (!date) return "N/A";
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
