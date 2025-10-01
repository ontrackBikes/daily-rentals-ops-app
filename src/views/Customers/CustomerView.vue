<template>
  <deep-layout>
    <v-container fluid>
      <v-row dense>
        <!-- LEFT: Customer Info -->
        <v-col cols="12" md="3">
          <v-skeleton-loader v-if="loading" type="card" />
          <v-card outlined class="pa-4 rounded-lg">
            <CustomerViewer v-if="customer" :customer_id="customer_id" />
          </v-card>
        </v-col>

        <!-- RIGHT: Tabs Section -->
        <v-col cols="12" md="9">
          <v-card flat>
            <v-tabs v-model="tab">
              <v-tab>Orders</v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
              <!-- Orders Tab -->
              <v-tab-item>
                <OrdersTab :customerId="customer_id"></OrdersTab>
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </deep-layout>
</template>

<script>
import api from "@/plugins/axios";
import Swal from "sweetalert2";
import OrdersTab from "./CustomerTabs/OrdersTab.vue";
import DeepLayout from "@/Layouts/DeepLayout.vue";
import CustomerViewer from "@/components/CustomerViewer.vue";

export default {
  components: { OrdersTab, DeepLayout, CustomerViewer },
  data() {
    return {
      customer_id: null,
      loading: false,
      tab: 0,
      customer: "",
    };
  },

  mounted() {
    this.customer_id = this.$route.params.customer_id;
    this.loadCustomer();
  },

  methods: {
    async loadCustomer() {
      this.loading = true;
      try {
        const { data } = await api.get(`/api/customer/${this.customer_id}`);
        this.customer = data.data || null;
      } catch (error) {
        console.error("Error loading customer:", error);
        Swal.fire({
          title: "Error",
          text:
            error.response?.data?.message || "Failed to load customer details",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
