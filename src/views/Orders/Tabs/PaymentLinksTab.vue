<template>
  <v-container>
    <!-- Top Section -->
    <div class="d-flex justify-space-between my-2">
      <h3 class="my-auto">Payment Links for Order #{{ orderId }}</h3>
      <v-btn
        color="primary"
        class="my-auto"
        @click="openCreateLinkDialog = true"
      >
        Create Payment Link
      </v-btn>
    </div>

    <!-- Payment Links Table -->
    <v-card outlined class="rounded-lg">
      <v-overlay :value="loading">
        <v-progress-circular indeterminate size="64" color="primary" />
      </v-overlay>

      <v-simple-table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>URL</th>
            <th>Expiry</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="link in paymentLinks" :key="link.link_id">
            <td>{{ link.link_id }}</td>
            <td>{{ link.amount }}</td>
            <td>{{ link.status }}</td>
            <td>
              <a :href="link.url" target="_blank">{{ link.url }}</a>

              <v-icon class="mr-2" small @click="copyLink(link.url)"
                >mdi-content-copy</v-icon
              >
            </td>
            <td>{{ link.expiry | moment }}</td>
            <td>{{ link.created_at | moment }}</td>
          </tr>
          <tr v-if="!paymentLinks.length && !loading">
            <td colspan="7" class="text-center">No payment links found</td>
          </tr>
        </tbody>
      </v-simple-table>

      <!-- Pagination -->
      <!-- <v-card-actions class="justify-center">
        <v-btn :disabled="offset === 0 || loading" @click="prevPage"
          >Previous</v-btn
        >
        <v-btn :disabled="offset + limit >= total || loading" @click="nextPage"
          >Next</v-btn
        >
      </v-card-actions> -->
    </v-card>

    <!-- Create Payment Link Dialog -->
    <v-dialog v-model="openCreateLinkDialog" max-width="500px">
      <v-card :loading="loading">
        <v-overlay :value="loading">
          <v-progress-circular indeterminate size="64" color="primary" />
        </v-overlay>

        <v-container>
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Create Payment Link</div>
            <v-btn icon @click="openCreateLinkDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-form ref="linkForm" v-model="linkFormValid" class="mt-4">
            <v-row>
              <v-col cols="12">
                <label class="text-subtitle-2">Amount</label>
                <v-text-field
                  v-model="newLink.amount"
                  placeholder="Enter amount"
                  type="number"
                  dense
                  outlined
                  hide-details
                  :rules="[rules.required, rules.positive]"
                />
              </v-col>
            </v-row>
          </v-form>

          <div class="d-flex justify-end mt-4">
            <v-btn
              color="primary"
              :disabled="!linkFormValid || loading"
              @click="createPaymentLink"
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

export default {
  name: "OrderPaymentLinks",
  data() {
    return {
      paymentLinks: [],
      total: 0,
      limit: 10,
      offset: 0,
      orderId: this.$route.params.id,
      loading: false,
      openCreateLinkDialog: false,

      selectedLink: {},
      linkFormValid: false,
      newLink: { amount: "" },
      rules: {
        required: (v) => !!v || "This field is required",
        positive: (v) => v > 0 || "Amount must be greater than 0",
      },
    };
  },
  mounted() {
    this.fetchPaymentLinks();
  },
  methods: {
    async fetchPaymentLinks() {
      try {
        this.loading = true;
        const { data } = await api.get(
          `/api/order/${this.orderId}/payment-links`,
          {
            params: { limit: this.limit, offset: this.offset },
          }
        );
        this.paymentLinks = data.data.paymentLinks || [];
        this.total = data.data.meta.total || 0;
      } catch (err) {
        console.error(err);
        this.$swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.error || "Failed to fetch payment links",
        });
      } finally {
        this.loading = false;
      }
    },

    async createPaymentLink() {
      this.$refs.linkForm.validate();
      if (!this.linkFormValid) return;

      try {
        this.loading = true;
        const payload = { amount: Number(this.newLink.amount) };
        const { data } = await api.post(
          `/api/order/${this.orderId}/payment-link`,
          payload
        );

        this.$swal.fire({
          icon: "success",
          title: "Payment Link Created",
          text: data.message || "Payment link created successfully.",
        });

        this.openCreateLinkDialog = false;
        this.newLink.amount = "";
        this.linkFormValid = false;

        this.fetchPaymentLinks();
      } catch (err) {
        console.error(err);
        this.$swal.fire({
          icon: "error",
          title: "Error",
          text:
            err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to create payment link",
        });
      } finally {
        this.loading = false;
      }
    },

    copyLink(url) {
      navigator.clipboard.writeText(url);
    },

    prevPage() {
      if (this.offset >= this.limit) {
        this.offset -= this.limit;
        this.fetchPaymentLinks();
      }
    },

    nextPage() {
      if (this.offset + this.limit < this.total) {
        this.offset += this.limit;
        this.fetchPaymentLinks();
      }
    },
  },
};
</script>
