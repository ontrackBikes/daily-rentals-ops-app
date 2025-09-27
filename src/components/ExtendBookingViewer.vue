<template>
  <v-dialog v-model="internalDialog" max-width="800px" @input="onDialogChange">
    <v-card>
      <v-card-title>
        <span class="headline">Extend Booking</span>
      </v-card-title>
      <v-divider />

      <!-- Loader Overlay -->
      <v-overlay absolute :value="loading">
        <v-progress-circular indeterminate color="primary" size="64" />
      </v-overlay>

      <v-card-text>
        <!-- Error -->
        <v-alert v-if="error" type="error" dense outlined class="mb-4">
          {{ error }}
        </v-alert>

        <!-- No Plans -->
        <div
          v-if="!loading && !error && lineItems.length === 0"
          class="text-center py-6"
        >
          <v-icon size="48" color="grey lighten-1">mdi-calendar-remove</v-icon>
          <p class="mt-3 subtitle-2 grey--text">No extension plans available</p>
        </div>

        <!-- Plans -->
        <v-form v-else ref="extendForm">
          <h4 class="mt-4 mb-2">Select Your Plan</h4>
          <v-radio-group v-model="form.plan">
            <v-row dense>
              <v-col
                cols="12"
                md="6"
                v-for="item in lineItems"
                :key="item.plan"
              >
                <v-card
                  outlined
                  class="cursor-pointer rounded-lg hover-elevate"
                  :class="{
                    'border-primary': form.plan === item.plan,
                  }"
                  @click="form.plan = item.plan"
                >
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center mb-3">
                      <v-radio
                        :value="item.plan"
                        color="primary"
                        class="mr-3"
                      />
                      <div>
                        <h3 class="font-weight-bold">
                          {{ item.plan | capitalize }} Plan
                        </h3>
                        <p class="text--secondary mb-0">
                          {{ item.days_covered }} days • ₹{{ item.total }}
                        </p>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-radio-group>
        </v-form>

        <!-- Price Breakdown -->
        <v-expand-transition>
          <div v-if="selectedBreakdown" class="mt-6">
            <h4 class="mb-3">Price Breakdown</h4>
            <v-card outlined>
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>Base Amount</v-list-item-content>
                  <v-list-item-content class="text-right">
                    ₹{{ selectedBreakdown.base_amount }}
                  </v-list-item-content>
                </v-list-item>
                <v-list-item v-if="selectedBreakdown.penalty_amount > 0">
                  <v-list-item-content>Penalty</v-list-item-content>
                  <v-list-item-content class="text-right">
                    ₹{{ selectedBreakdown.penalty_amount }}
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item>
                  <v-list-item-content>Total Amount</v-list-item-content>
                  <v-list-item-content class="text-right font-weight-bold">
                    ₹{{ selectedBreakdown.total_amount }}
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content class="font-weight-bold"
                    >Payable Amount</v-list-item-content
                  >
                  <v-list-item-content
                    class="text-right font-weight-bold text-primary"
                  >
                    ₹{{ selectedBreakdown.payable_amount }}
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </div>
        </v-expand-transition>
      </v-card-text>

      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="closeDialog">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="!form.plan && !form.customEndDate"
          @click="confirm"
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-dialog>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "ExtendBookingDialog",
  props: {
    value: { type: Boolean, default: false },
    booking_id: { type: [String, Number], required: true },
  },
  data() {
    return {
      internalDialog: this.value,
      loading: false,
      error: null,
      lineItems: [],
      planDetails: null,

      form: {
        plan: null,
      },
      snackbar: {
        show: false,
        message: "",
        color: "error",
      },
    };
  },
  computed: {
    selectedBreakdown() {
      if (!this.form.plan || !this.planDetails) return null;
      return {
        base_amount: this.planDetails.base_amount,
        penalty_amount: this.planDetails.penalty_amount,
        total_amount: this.planDetails.total_amount,
        payable_amount: this.planDetails.payable_amount,
      };
    },
  },
  watch: {
    value(val) {
      this.internalDialog = val;
      if (val) {
        this.fetchPlans();
      }
    },
    internalDialog(val) {
      this.$emit("input", val);
    },
  },
  methods: {
    async fetchPlans() {
      this.error = null;
      this.lineItems = [];
      if (!this.booking_id) {
        this.error = "Booking ID missing.";
        return;
      }
      this.loading = true;
      try {
        const res = await api.get(
          `/api/app/bookings/extension/${this.booking_id}/calculate`
        );
        if (res.data.success) {
          this.lineItems = res.data.line_items || [];
          this.planDetails = res.data;
        } else {
          this.error = "Failed to load extension plans.";
        }
      } catch (err) {
        console.error("API error:", err);
        this.error = "Unable to fetch extension plans.";
      } finally {
        this.loading = false;
      }
    },
    onDialogChange(val) {
      this.$emit("input", val);
    },
    closeDialog() {
      this.internalDialog = false;
    },
    confirm() {
      if (!this.form.plan && !this.form.customEndDate) {
        this.showSnackbar("Please select a plan or custom date");
        return;
      }
      this.$emit("confirm", this.form);
      this.closeDialog();
    },
    showSnackbar(message, color = "error") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
  filters: {
    capitalize(value) {
      if (!value) return "";
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },
};
</script>

<style scoped>
.hover-elevate:hover {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.12);
}
.border-primary {
  border: 2px solid #1976d2 !important;
}
</style>
