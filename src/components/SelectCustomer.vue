<template>
  <div>
    <!-- Trigger Card -->
    <v-card
      outlined
      @click="dialog = true"
      class="pa-4 d-flex justify-space-between align-center"
      :loading="loading"
      style="cursor: pointer"
    >
      <span>{{ value?.display_name || "Select Customer" }}</span>
      <v-icon right>mdi-account-search</v-icon>
    </v-card>

    <!-- Customer Selection Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center mb-2">
            <div class="text-h6 font-weight-bold">Select Customer</div>
            <v-btn icon @click="dialog = false"
              ><v-icon>mdi-close</v-icon></v-btn
            >
          </div>

          <!-- Search -->
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search by name or phone..."
            outlined
            dense
            hide-details
            class="mb-2"
          />

          <v-divider class="mb-2" />

          <!-- List -->
          <v-list dense>
            <v-list-item
              v-for="customer in customers"
              :key="customer.customer_id"
              @click="selectCustomer(customer)"
              class="hoverable"
            >
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">
                  {{ customer.display_name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ customer.user_data?.phone || "N/A" }} •
                  {{ customer.email || "No Email" }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <!-- No Results -->
            <div
              v-if="!loading && customers.length === 0"
              class="text-center pa-6 d-flex flex-column align-center justify-center"
            >
              <v-icon color="grey" size="48">mdi-account-off-outline</v-icon>
              <div class="text-subtitle-1 mt-2">No customers found</div>
              <div class="text-caption mb-3">
                Try refining your search or create a new customer.
              </div>
              <v-btn
                rounded
                depressed
                color="primary"
                small
                @click="openCreateDialog"
              >
                Create New "{{ search }}"
              </v-btn>
            </div>
          </v-list>

          <!-- Load More -->
          <v-btn
            v-if="hasMore"
            block
            rounded
            depressed
            text
            :loading="loading"
            @click="fetchCustomers"
            >Load More</v-btn
          >
        </v-container>

        <v-card-actions>
          <v-spacer />
          <v-btn text rounded depressed color="error" @click="dialog = false"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Customer Dialog -->
    <v-dialog v-model="createDialog" max-width="500px">
      <v-card>
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center mb-2">
            <div class="text-h6 font-weight-bold">Create New Customer</div>
            <v-btn icon @click="createDialog = false"
              ><v-icon>mdi-close</v-icon></v-btn
            >
          </div>

          <v-form ref="form" v-model="formValid" lazy-validation>
            <!-- Name -->
            <div class="mb-2">
              <label class="text-subtitle-2">
                Name <span class="red--text">*</span>
              </label>
              <v-text-field
                v-model="newCustomer.name"
                outlined
                dense
                :rules="[rules.required]"
                hide-details
              />
            </div>

            <!-- Phone -->
            <div class="mb-2">
              <label class="text-subtitle-2">
                Phone <span class="red--text">*</span>
              </label>
              <v-text-field
                v-model="newCustomer.phone"
                outlined
                dense
                :rules="[rules.required, rules.phoneOrEmail]"
                hide-details
              />
            </div>

            <!-- Email -->
            <div class="mb-2">
              <label class="text-subtitle-2">
                Email <span class="red--text">*</span>
              </label>
              <v-text-field
                v-model="newCustomer.email"
                outlined
                dense
                :rules="[rules.required, rules.phoneOrEmail]"
                hide-details
              />
            </div>

            <!-- Address -->
            <div>
              <label class="text-subtitle-2">Address</label>
              <v-text-field
                v-model="newCustomer.address"
                outlined
                dense
                hide-details
              />
            </div>
          </v-form>
        </v-container>

        <v-card-actions>
          <v-spacer />
          <v-btn text rounded depressed @click="createDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            rounded
            depressed
            color="primary"
            :loading="creating"
            :disabled="!formValid"
            @click="createCustomer"
            >Create</v-btn
          >
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
    value: { type: Object, default: null },
    params: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      dialog: false,
      createDialog: false,
      customers: [],
      search: "",
      offset: 0,
      limit: 20,
      total: 0,
      loading: false,
      creating: false,
      formValid: false,
      newCustomer: {
        name: "",
        phone: "",
        email: "",
        address: "",
      },
      rules: {
        required: (v) => !!v || "This field is required",
        phoneOrEmail: (v) => {
          if (!v) return "This field is required";

          const phoneRegex = /^\d{10}$/;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          return phoneRegex.test(v) || emailRegex.test(v)
            ? true
            : "Enter a valid 10-digit phone or valid email";
        },
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
    this.throttledResetFetch = throttle(this.resetFetch, 400);
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
        console.error("Error fetching customers:", err);
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
      const isValid = await this.$refs.form.validate();
      if (!isValid) return;

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
