<template>
  <v-card class="pa-4 rounded-lg elevation-2" :loading="loading">
    <!-- Header -->
    <div class="text-h6 font-weight-bold mb-2">
      {{ localCustomer?.display_name || "Customer" }}
    </div>

    <!-- Basic Info -->
    <div class="text-body-2 mb-2">
      <v-icon small class="mr-1">mdi-phone</v-icon>
      {{ localCustomer?.user_data?.phone || "N/A" }}
    </div>

    <div class="text-body-2 mb-2">
      <v-icon small class="mr-1">mdi-email</v-icon>
      {{ localCustomer?.email || "N/A" }}
    </div>

    <div class="text-body-2 mb-2">
      <v-icon small class="mr-1">mdi-home</v-icon>
      {{ localCustomer?.address || "No address available" }}
    </div>

    <!-- Status & Verification -->
    <div class="text-body-2 d-flex align-center mb-1">
      <v-chip
        :color="localCustomer?.status === 'active' ? 'green' : 'grey'"
        small
        class="mr-2"
        text-color="white"
      >
        {{ localCustomer?.status }}
      </v-chip>
      <v-chip
        :color="
          localCustomer?.verification_status === 'verified' ? 'blue' : 'orange'
        "
        small
        text-color="white"
      >
        {{ localCustomer?.verification_status }}
      </v-chip>
    </div>

    <!-- Created At -->
    <div class="text-caption grey--text">
      Joined:
      {{ formatDate(localCustomer?.created_at) }}
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
