<template>
  <v-container>
    <v-card class="rounded-lg overflow-hidden" outlined>
      <!-- Body -->
      <v-container>
        <!-- Customer Info -->
        <v-row dense>
          <v-col cols="12" md="6">
            <div class="d-flex align-center my-2">
              <v-avatar size="48" color="primary" class="mr-3">
                <v-icon dark>mdi-account</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-bold text-h6">
                  {{ booking.order_data?.customer_data.display_name || "N/A" }}
                </div>
                <div class="text--secondary text-caption">
                  Customer ID: #{{ booking.order_data?.customer_id || "-" }}
                </div>
              </div>
            </div>

            <v-list dense flat class="transparent">
              <v-list-item>
                <v-list-item-icon
                  ><v-icon small color="primary"
                    >mdi-email-outline</v-icon
                  ></v-list-item-icon
                >
                <v-list-item-content>
                  {{ booking.order_data?.customer_data.email || "N/A" }}
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon
                  ><v-icon small color="primary"
                    >mdi-phone-outline</v-icon
                  ></v-list-item-icon
                >
                <v-list-item-content>
                  {{
                    booking.order_data?.customer_data.user_data.phone || "N/A"
                  }}
                </v-list-item-content>
              </v-list-item>

              <v-list-item @click="goToCustomerOrders">
                <v-list-item-icon
                  ><v-icon small color="primary"
                    >mdi-open-in-new</v-icon
                  ></v-list-item-icon
                >
                <v-list-item-content class="primary--text">
                  View All Orders
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-col>

          <!-- Vehicle + Pickup -->
          <v-col cols="12" md="6">
            <v-card class="pa-4 rounded-lg grey lighten-4" outlined>
              <div class="d-flex align-center mb-2">
                <v-icon color="primary" class="mr-2">mdi-motorbike</v-icon>
                <h4 class="mb-0 font-weight-medium">Vehicle Details</h4>
              </div>
              <div class="text--secondary">
                {{ booking.vehicle_data?.vehicle_name || "N/A" }}
                <br />
                Reg No: {{ booking.vehicle_data?.registration_number || "N/A" }}
              </div>

              <v-divider class="my-3"></v-divider>

              <div class="d-flex align-center mb-2">
                <v-icon color="primary" class="mr-2">mdi-map-marker</v-icon>
                <h4 class="mb-0 font-weight-medium">Pickup Location</h4>
              </div>
              <div class="text--secondary">
                {{
                  booking.vehicle_data?.location_data?.name
                    ? `${booking.vehicle_data.location_data.name} – ${booking.vehicle_data.location_data.address}`
                    : "N/A"
                }}
              </div>

              <v-divider class="my-3"></v-divider>

              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-counter</v-icon>
                <h4 class="font-weight-medium">Odometer Readings</h4>
              </div>

              <v-row class="mt-2" dense>
                <v-col cols="6">
                  <div class="text-caption text--secondary">Pre Odo</div>
                  <div class="text-h6 font-weight-bold">
                    {{
                      booking.pre_odo ||
                      booking.vehicle_data?.current_km ||
                      "N/A"
                    }}
                    km
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption text--secondary">Post Odo</div>
                  <div class="text-h6 font-weight-bold">
                    {{ booking.post_odo || "-" }}
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "OverviewTab",
  props: {
    booking: {
      type: Object,
      required: true,
    },
  },
  methods: {
    goToCustomerOrders() {
      const customerId = this.booking.order_data?.customer_id;
      if (customerId) this.$router.push(`/customer/${customerId}/orders`);
    },
    formatDate(dateStr) {
      if (!dateStr) return "-";
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>
