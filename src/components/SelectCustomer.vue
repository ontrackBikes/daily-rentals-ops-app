<template>
  <div>
    <!-- Trigger -->
    <v-card
      outlined
      @click="dialog = true"
      :loading="loading"
      style="cursor: pointer"
    >
      <div class="pa-4 d-flex justify-space-between align-center">
        <span>{{ value?.display_name || "Select Customer" }}</span>
        <v-icon right>mdi-account-search</v-icon>
      </div>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card min-height="300px">
        <v-card-title>
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search Customer"
            dense
            outlined
            hide-details
            class="flex-grow-1"
          />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-list>
            <v-list-item
              v-for="customer in customers"
              :key="customer.customer_id"
              @click="selectCustomer(customer)"
              class="hoverable"
            >
              <v-list-item-content>
                <v-list-item-title>{{
                  customer.display_name
                }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ customer.user_data?.phone || "N/A" }} •
                  {{ customer.email || "No email" }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <!-- No Result -->
            <v-list-item v-if="!loading && customers.length === 0">
              <v-list-item-content>
                <v-list-item-title>No customer found</v-list-item-title>
                <v-list-item-subtitle>
                  <v-btn small color="primary" @click="openCreateDialog">
                    Create new: {{ search }}
                  </v-btn>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <!-- Load More -->
          <v-btn
            v-if="hasMore"
            block
            text
            :loading="loading"
            @click="fetchCustomers"
          >
            Load More
          </v-btn>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text color="error" @click="dialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Dialog -->
    <v-dialog v-model="createDialog" max-width="500px">
      <v-card>
        <v-card-title>Create New Customer</v-card-title>
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <v-text-field v-model="newCustomer.name" label="Name" required />
            <v-text-field v-model="newCustomer.phone" label="Phone" required />
            <v-text-field v-model="newCustomer.email" label="Email" />
            <v-text-field v-model="newCustomer.address" label="Address" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            color="primary"
            @click="createCustomer"
            :loading="creating"
          >
            Create
          </v-btn>
          <v-btn text @click="createDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "@/plugins/axios";
import throttle from "lodash/throttle";

export default {
  name: "SelectCustomer",
  props: {
    value: {
      type: Object,
      default: null,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      dialog: false,
      createDialog: false,
      loading: false,
      creating: false,
      customers: [],
      offset: 0,
      limit: 20,
      total: 0,
      search: "",
      newCustomer: {
        name: "",
        phone: "",
        email: "",
        address: "",
      },
    };
  },
  computed: {
    hasMore() {
      return this.customers.length < this.total;
    },
  },
  watch: {
    search() {
      this.throttledResetFetch();
    },
  },
  created() {
    this.throttledResetFetch = throttle(this.resetFetch, 500);
  },
  methods: {
    resetFetch() {
      this.offset = 0;
      this.customers = [];
      this.total = 0;
      this.fetchCustomers();
    },
    async fetchCustomers() {
      this.loading = true;
      try {
        const res = await api.get("/api/customers", {
          params: {
            ...this.params,
            limit: this.limit,
            offset: this.offset,
            search: this.search,
          },
        });
        const data = res.data.data;
        this.total = data.meta.count;
        this.customers.push(...data.customers);
        this.offset += this.limit;
      } catch (err) {
        console.error("Failed to fetch customers", err);
      } finally {
        this.loading = false;
      }
    },
    selectCustomer(customer) {
      this.$emit("input", customer);
      this.dialog = false;
    },
    openCreateDialog() {
      this.dialog = false;
      this.createDialog = true;
      this.newCustomer = {
        name: this.search,
        phone: "",
        email: "",
        address: "",
      };
    },
    async createCustomer() {
      this.creating = true;
      try {
        const res = await api.post("/api/customer", this.newCustomer);
        const created = res.data.data;

        const customer = {
          ...created.dataValues,
          user_data: {
            phone: created.phone,
          },
        };

        this.$emit("input", customer);
        this.createDialog = false;
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to create customer";

        this.$swal.fire({
          icon: "error",
          title: "Error",
          text: message,
          width: 600,
        });
      } finally {
        this.creating = false;
      }
    },
  },
};
</script>

<style scoped>
.hoverable {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.hoverable:hover {
  background-color: #f5f5f5;
}
</style>
