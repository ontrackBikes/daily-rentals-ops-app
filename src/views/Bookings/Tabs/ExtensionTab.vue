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
            <td>{{ ext.extension_id || "N/A" }}</td>
            <td>
              <v-chip
                small
                :color="ext.payment_status === 'pending' ? 'orange' : 'green'"
                dark
              >
                {{ ext.payment_status }}
                <span v-if="ext.payment_status === 'pending'" class="ml-1"
                  >Update</span
                >
              </v-chip>
            </td>
            <td>{{ formatDate(ext.old_end_date) }}</td>
            <td>{{ formatDate(ext.new_end_date) }}</td>
            <td>{{ ext.amount || "N/A" }}</td>
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
import api from "@/plugins/axios";

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
    async loadExtensions() {
      try {
        const { data } = await api.get(
          `/api/bookings/${this.booking.booking_id}/extensions`
        );
        this.extensions = data.extensions || [];
      } catch (error) {
        console.error("Failed to load extensions:", error);
        this.extensions = [];
      }
    },
  },
};
</script>
