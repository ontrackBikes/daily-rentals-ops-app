<template>
  <v-container>
    <v-card outlined class="rounded-lg">
      <v-simple-table>
        <thead>
          <tr>
            <th>Extension ID</th>
            <th>Payment Status</th>
            <th>Old End Date</th>
            <th>New End Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ext, i) in extensions" :key="i">
            <td>{{ ext.line_item_id || "N/A" }}</td>
            <td>
              <v-chip
                small
                :color="
                  booking.order_data.payment_status === 'pending'
                    ? 'orange'
                    : 'green'
                "
                dark
              >
                {{ booking.order_data.payment_status }}
              </v-chip>
            </td>
            <td>{{ formatDate(ext.old_end_date || booking.start_date) }}</td>
            <td>{{ formatDate(ext.new_end_date || booking.end_date) }}</td>
            <td>{{ ext.net_total || "N/A" }}</td>
          </tr>
          <tr v-if="!extensions.length">
            <td colspan="5" class="text-center">No extensions found</td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card>
  </v-container>
</template>

<script>
import moment from "moment";

export default {
  name: "ExtensionsTab",
  props: {
    booking: Object,
  },
  data() {
    return {
      extensions: [],
    };
  },
  mounted() {
    this.loadExtensions();
  },
  methods: {
    formatDate(date) {
      return date ? moment(date).format("DD/MM/YYYY") : "N/A";
    },
    loadExtensions() {
      // ✅ Filter extensions from booking data
      if (this.booking?.booking_line_item_data?.length) {
        this.extensions = this.booking.booking_line_item_data.filter(
          (item) => item.product_subtype === "extension"
        );
      } else {
        this.extensions = [];
      }
    },
  },
};
</script>
