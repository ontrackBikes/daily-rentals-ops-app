<template>
  <v-container>
    <div>
      <v-row align="center" class="mb-4">
        <!-- Title -->
        <v-col cols="12" md="4" class="d-flex align-center">
          <div class="text-h6 font-weight-bold">Customers ({{ total }})</div>
        </v-col>

        <!-- Search Field -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchQuery"
            append-icon="mdi-magnify"
            placeholder="Search by name, phone & email..."
            dense
            outlined
            hide-details
            @input="onSearchInput"
            @keyup.enter="fetchCustomers"
            class="rounded-lg"
          />
        </v-col>

        <!-- Status Filter + Add Button -->
        <v-col cols="12" md="4" class="d-flex align-center justify-end">
          <v-select
            v-model="selectedStatus"
            :items="statusOptions"
            label="Status"
            outlined
            dense
            hide-details
            class="rounded-lg mr-2"
            @change="fetchCustomers"
          />

          <v-btn
            rounded
            color="primary"
            dark
            @click="openCreateCustomerDialog = true"
          >
            <v-icon left>mdi-plus</v-icon>
            Add Customer
          </v-btn>
        </v-col>
      </v-row>

      <v-card class="rounded-lg my-4" outlined :loading="loading">
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">Name</th>
              <th class="text-left">Phone</th>
              <th class="text-left">Email</th>
              <th class="text-left">Status</th>
              <th class="text-left">Created At</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in customers" :key="customer.id">
              <td>{{ customer.customer_id }}</td>
              <td>{{ customer.display_name }}</td>
              <td>{{ customer.user_data?.phone }}</td>
              <td>
                {{
                  customer.customer_contact_data?.find(
                    (c) => c.type === "email" && c.is_primary
                  )?.value || "—"
                }}
              </td>
              <td>
                <v-chip
                  :color="getStatusColor(customer.status, 'customer')"
                  small
                >
                  {{ customer.status }}
                </v-chip>
              </td>
              <td>{{ customer.created_at | moment }}</td>
              <td>
                <v-btn
                  small
                  outlined
                  color="primary"
                  rounded
                  @click="viewCustomer(customer.customer_id)"
                >
                  View
                </v-btn>
              </td>
            </tr>
            <tr v-if="!customers.length">
              <td colspan="7" class="text-center grey--text">
                No customers found.
              </td>
            </tr>
          </tbody>
        </v-simple-table>

        <v-divider></v-divider>
        <v-card-actions class="justify-center">
          <v-pagination
            v-model="page"
            :length="pageCount"
            circle
            total-visible="5"
            @input="fetchCustomers"
          />
        </v-card-actions>
      </v-card>
    </div>

    <!-- Add Customer dialog -->
    <v-dialog v-model="openCreateCustomerDialog" max-width="500px">
      <v-card :loading="loading">
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Add Customer</div>
            <v-btn icon @click="openCreateCustomerDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Form -->
          <div class="my-4">
            <v-form ref="form" v-model="formValid">
              <!-- Name -->
              <label class="text-subtitle-2">
                Name <span class="red--text">*</span>
              </label>
              <div class="mb-3">
                <v-text-field
                  v-model="form.name"
                  :rules="[rules.required]"
                  required
                  outlined
                  dense
                  hide-details
                />
              </div>

              <!-- Phone -->
              <label class="text-subtitle-2">
                Phone <span class="red--text">*</span>
              </label>
              <div class="mb-3">
                <v-text-field
                  v-model="form.phone"
                  type="tel"
                  :rules="[rules.required, rules.numeric]"
                  required
                  outlined
                  dense
                  hide-details
                />
              </div>

              <!-- Email -->
              <label class="text-subtitle-2">
                Email <span class="red--text">*</span>
              </label>
              <div class="mb-3">
                <v-text-field
                  v-model="form.email"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  required
                  outlined
                  dense
                  hide-details
                />
              </div>

              <!-- Address -->
              <label class="text-subtitle-2">Address</label>
              <div class="mb-3">
                <v-textarea
                  v-model="form.address"
                  outlined
                  dense
                  rows="2"
                  hide-details
                />
              </div>
            </v-form>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex justify-end my-2">
            <v-btn
              text
              rounded
              @click="openCreateCustomerDialog = false"
              class="mr-2"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              :disabled="!formValid"
              @click="createCustomer"
              rounded
            >
              Create
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/plugins/axios";
import StatusService from "@/plugins/statusColor";
import debounce from "lodash/debounce";

export default {
  name: "CustomerList",
  data() {
    return {
      loading: false,
      customers: [],
      total: 0,
      page: 1,
      limit: 10,
      pageCount: 1,
      searchQuery: "",
      selectedStatus: "",
      statusOptions: [
        { text: "All Statuses", value: "" },
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      openCreateCustomerDialog: false,
      formValid: false,
      form: {
        name: "",
        phone: "",
        email: "",
        address: "",
      },
      rules: {
        required: (value) => !!value || "Required.",
        email: (value) =>
          !value ||
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
          "Invalid email.",
        numeric: (value) =>
          /^\d{10}$/.test(value) || "Must be exactly 10 digits",
      },
    };
  },

  watch: {
    searchQuery: {
      handler: "onSearchInput",
    },
  },

  created() {
    this.onSearchInput = debounce(this.fetchCustomers, 400);
  },

  mounted() {
    this.fetchCustomers();
  },

  methods: {
    async fetchCustomers() {
      this.loading = true;
      const offset = (this.page - 1) * this.limit;
      try {
        const { data } = await api.get("/api/customers", {
          params: {
            limit: this.limit,
            offset,
            search: this.searchQuery || undefined,
            status: this.selectedStatus,
          },
        });

        this.customers = data?.data?.customers || [];
        this.total = data?.data?.meta?.count || 0;
        this.pageCount = Math.ceil(this.total / this.limit) || 1;
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        this.loading = false;
      }
    },

    async createCustomer() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;

      try {
        const response = await api.post("/api/customer", this.form);

        this.openCreateCustomerDialog = false;
        this.$refs.form.reset();
        this.fetchCustomers();

        this.$swal.fire({
          icon: "success",
          title: "Customer Created",
          text: response.data?.message || "Customer Added successfully!",
          confirmButtonColor: "#1976d2",
        });
      } catch (err) {
        console.error("Add error:", err);

        this.$swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "Something went wrong!",
          confirmButtonColor: "#d33",
        });
      } finally {
        this.loading = false;
      }
    },

    viewCustomer(id) {
      this.$router.push(`/customer/${id}`);
    },

    getStatusColor(status, type) {
      return StatusService.getColor(status, type);
    },
  },
};
</script>

<style scoped></style>
