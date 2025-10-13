<template>
  <v-container>
    <!-- Header: Title + Search + Add -->
    <v-row class="align-center">
      <v-col cols="12" md="6">
        <div class="text-h6 font-weight-bold">Plans ({{ total }})</div>
      </v-col>
      <v-col cols="12" md="6">
        <div class="d-flex justify-end align-center">
          <v-text-field
            v-model="searchQuery"
            append-icon="mdi-magnify"
            placeholder="Search by plan name or type"
            dense
            hide-details
            outlined
            class="rounded-lg mr-2"
            @input="onSearchInput"
            @keyup.enter="fetchPlans"
          />
          <v-btn color="primary" dark rounded depressed @click="openAddDialog">
            <v-icon left>mdi-plus</v-icon> Add plan
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Plans Table -->
    <v-card class="rounded-lg my-4" outlined :loading="loading">
      <v-simple-table>
        <thead>
          <tr>
            <th class="text-left">ID</th>
            <th class="text-left">Name</th>
            <th class="text-left">Type</th>
            <th class="text-left">KM Cap</th>
            <th class="text-left">Extra KM Rate</th>
            <th class="text-left">Late Fee/Hr</th>
            <th class="text-left">Cancellation Fee</th>
            <th class="text-left">Active</th>
            <th class="text-left">Waitlist</th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plan in plans" :key="plan.plan_id">
            <td>{{ plan.plan_id }}</td>
            <td>{{ plan.plan_name }}</td>
            <td>{{ plan.plan_type }}</td>
            <td>{{ plan.km_cap }}</td>
            <td>{{ plan.extra_km_rate }}</td>
            <td>{{ plan.late_fee_per_hour }}</td>
            <td>{{ plan.cancellation_fee }}</td>
            <td>
              <v-chip
                small
                outlined
                :class="plan.is_active ? 'success--text' : 'error--text'"
              >
                {{ plan.is_active ? "Active" : "Inactive" }}
              </v-chip>
            </td>
            <td>
              <v-chip
                small
                outlined
                :class="plan.allow_waitlist ? 'success--text' : 'error--text'"
              >
                {{ plan.allow_waitlist ? "Yes" : "No" }}
              </v-chip>
            </td>
            <td>
              <v-btn small icon color="primary" @click="openEditDialog(plan)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </td>
          </tr>
          <tr v-if="!plans.length">
            <td colspan="10" class="text-center grey--text">No plans found.</td>
          </tr>
        </tbody>
      </v-simple-table>

      <!-- Pagination -->
      <v-divider />
      <v-card-actions class="justify-center">
        <v-pagination
          v-model="page"
          :length="pageCount"
          total-visible="5"
          circle
          @input="fetchPlans"
        />
      </v-card-actions>
    </v-card>

    <!-- Add / Update Plan Dialog -->
    <v-dialog v-model="openPlanDialog" max-width="800px">
      <v-card :loading="loading">
        <v-container>
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">
              {{ isEditMode ? "Update Plan" : "Add Plan" }}
            </div>
            <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
          </div>

          <v-form ref="form" v-model="formValid" class="my-4">
            <!-- Plan Name -->
            <label class="text-subtitle-2"
              >Plan Name <span class="red--text">*</span></label
            >
            <v-text-field
              v-model="form.plan_name"
              :rules="[rules.required]"
              outlined
              dense
              hide-details
              :disabled="isEditMode"
            />

            <!-- Plan Type -->
            <label class="text-subtitle-2"
              >Plan Type <span class="red--text">*</span></label
            >
            <v-select
              v-model="form.plan_type"
              :items="planTypes"
              :rules="[rules.required]"
              outlined
              dense
              hide-details
              :disabled="isEditMode"
            />

            <!-- Description -->
            <label class="text-subtitle-2">Description</label>
            <v-textarea
              v-model="form.plan_description"
              outlined
              dense
              rows="2"
              hide-details
              :disabled="isEditMode"
            />

            <!-- Terms -->
            <label class="text-subtitle-2">Terms</label>
            <v-textarea
              v-model="form.plan_terms"
              outlined
              dense
              rows="2"
              hide-details
              :disabled="isEditMode"
            />

            <!-- Numeric Fields -->
            <v-row>
              <v-col cols="12" md="6">
                <label class="text-subtitle-2"
                  >KM Cap <span class="red--text">*</span></label
                >
                <v-text-field
                  v-model.number="form.km_cap"
                  type="number"
                  :rules="[rules.required, rules.positive]"
                  outlined
                  dense
                  hide-details
                  :disabled="isEditMode"
                />
              </v-col>
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Extra KM Rate</label>
                <v-text-field
                  v-model.number="form.extra_km_rate"
                  type="number"
                  outlined
                  dense
                  hide-details
                  :disabled="isEditMode"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Security Deposit</label>
                <v-text-field
                  v-model.number="form.security_deposit"
                  type="number"
                  outlined
                  dense
                  hide-details
                  :disabled="isEditMode"
                />
              </v-col>
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Late Fee / Hour</label>
                <v-text-field
                  v-model.number="form.late_fee_per_hour"
                  type="number"
                  outlined
                  dense
                  hide-details
                  :disabled="isEditMode"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <label class="text-subtitle-2">Cancellation Fee</label>
                <v-text-field
                  v-model.number="form.cancellation_fee"
                  type="number"
                  outlined
                  dense
                  hide-details
                  :disabled="isEditMode"
                />
              </v-col>
            </v-row>

            <!-- Toggles -->
            <v-switch v-model="form.is_active" label="Active" color="success" />
            <v-switch
              v-model="form.allow_waitlist"
              label="Allow Waitlist"
              color="primary"
              :disabled="isEditMode"
            />
          </v-form>

          <!-- Actions -->
          <div class="d-flex justify-end mt-4">
            <v-btn text class="mr-2" rounded @click="closeDialog">Cancel</v-btn>
            <v-btn
              color="primary"
              rounded
              depressed
              :disabled="!formValid"
              @click="isEditMode ? updatePlan() : createPlan()"
            >
              {{ isEditMode ? "Update" : "Add" }}
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/plugins/axios";
import debounce from "lodash/debounce";

export default {
  name: "PlanList",
  data() {
    return {
      loading: false,
      plans: [],
      total: 0,
      page: 1,
      limit: 10,
      pageCount: 1,
      searchQuery: "",
      openPlanDialog: false,
      isEditMode: false,
      formValid: false,
      planTypes: ["daily", "weekly", "monthly"],
      form: this.defaultForm(),
      rules: {
        required: (v) => !!v || "Required.",
        positive: (v) => v >= 0 || "Must be greater than or equal to 0",
      },
    };
  },
  watch: {
    searchQuery: {
      handler: "onSearchInput",
    },
  },
  created() {
    this.onSearchInput = debounce(this.fetchPlans, 400);
  },
  mounted() {
    this.fetchPlans();
  },
  methods: {
    defaultForm() {
      return {
        plan_id: null,
        plan_name: "",
        plan_type: "monthly",
        plan_description: "",
        plan_terms: "",
        km_cap: 0,
        extra_km_rate: 0,
        security_deposit: 0,
        late_fee_per_hour: 0,
        cancellation_fee: 0,
        is_active: true,
        allow_waitlist: true,
      };
    },
    async fetchPlans() {
      this.loading = true;
      const offset = (this.page - 1) * this.limit;
      try {
        const { data } = await api.get("/api/plans", {
          params: {
            limit: this.limit,
            offset,
            search: this.searchQuery || undefined,
          },
        });
        this.plans = data?.data?.plans || [];
        this.total = data?.data?.meta?.total || 0;
        this.pageCount = Math.ceil(this.total / this.limit) || 1;
      } catch (err) {
        console.error(err);
        this.$swal.fire("Error", "Failed to fetch plans", "error");
      } finally {
        this.loading = false;
      }
    },
    openAddDialog() {
      this.form = this.defaultForm();
      this.isEditMode = false;
      this.openPlanDialog = true;
    },
    openEditDialog(plan) {
      this.form = { ...plan };
      this.isEditMode = true;
      this.openPlanDialog = true;
    },
    closeDialog() {
      this.openPlanDialog = false;
      this.form = this.defaultForm();
      this.formValid = false;
    },
    async createPlan() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      try {
        await api.post("/api/plan", this.form);
        this.closeDialog();
        this.fetchPlans();
        this.$swal.fire("Success", "Plan created successfully!", "success");
      } catch (err) {
        this.$swal.fire(
          "Error",
          err.response?.data?.message || "Failed to create plan",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },
    async updatePlan() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      try {
        await api.put(`/api/plan/${this.form.plan_id}/update-status`, {
          is_active: this.form.is_active,
        });
        this.closeDialog();
        this.fetchPlans();
        this.$swal.fire("Success", "Plan updated successfully!", "success");
      } catch (err) {
        this.$swal.fire(
          "Error",
          err.response?.data?.message || "Failed to update plan",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped></style>
