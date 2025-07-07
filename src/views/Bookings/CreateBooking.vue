<template>
  <deep-layout>
    <v-container>
      <v-card class="pa-4 rounded-lg" outlined>
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <!-- Customer Selection -->
            <div class="mb-4">
              <label class="font-weight-medium">
                Select Customer <span class="red--text">*</span>
              </label>
              <SelectCustomer v-model="formData.customer" />
            </div>

            <div v-if="formData.customer">
              <!-- Start/End Date -->
              <v-row dense>
                <v-col cols="6">
                  <label class="font-weight-medium">
                    Start Date <span class="red--text">*</span>
                  </label>
                  <v-text-field
                    v-model="formData.start_date"
                    type="date"
                    :min="today"
                    outlined
                    dense
                    :rules="[rules.required]"
                    hide-details
                    class="mb-3"
                  />
                </v-col>

                <v-col cols="6">
                  <label class="font-weight-medium">
                    End Date <span class="red--text">*</span>
                  </label>
                  <v-text-field
                    v-model="formData.end_date"
                    type="date"
                    :min="formData.start_date || today"
                    outlined
                    dense
                    :rules="[rules.required]"
                    hide-details
                    class="mb-3"
                  />
                </v-col>
              </v-row>

              <!-- Start/End Time -->
              <v-row dense>
                <v-col cols="6">
                  <label class="font-weight-medium">
                    Start Time <span class="red--text">*</span>
                  </label>
                  <v-text-field
                    v-model="formData.start_time"
                    type="time"
                    outlined
                    dense
                    :rules="[rules.required]"
                    hide-details
                    class="mb-3"
                  />
                </v-col>
                <v-col cols="6">
                  <label class="font-weight-medium">
                    End Time <span class="red--text">*</span>
                  </label>
                  <v-text-field
                    v-model="formData.end_time"
                    type="time"
                    outlined
                    dense
                    :rules="[rules.required]"
                    hide-details
                    class="mb-3"
                  />
                </v-col>
              </v-row>

              <!-- Model Selection -->
              <div class="mb-4">
                <label class="font-weight-medium">
                  Select Model <span class="red--text">*</span>
                </label>
                <SelectModel v-model="formData.model" />
              </div>

              <!-- Vehicle Selection -->
              <div v-if="formData.model" class="mb-4">
                <label class="font-weight-medium">
                  Select Vehicle <span class="red--text">*</span>
                </label>
                <SelectVehicle
                  v-model="formData.vehicle"
                  :params="{
                    status: 'available',
                    model_id: formData.model.model_id,
                  }"
                />
              </div>

              <!-- Addons -->
              <div class="mb-4" v-if="addons.length">
                <label class="font-weight-medium">Addons</label>

                <v-row>
                  <v-col
                    v-for="(addon, index) in addons"
                    :key="addon._id || index"
                    cols="6"
                    md="3"
                  >
                    <v-card
                      outlined
                      class="pa-4 d-flex flex-column align-center text-center"
                    >
                      <v-icon size="40" class="mb-2">mdi-helmet</v-icon>

                      <div class="font-weight-medium">{{ addon.name }}</div>
                      <div class="text-subtitle-2 font-weight-bold">
                        Rs {{ addon.price }}
                      </div>

                      <div class="mt-3">
                        <v-btn-toggle
                          v-if="addon.quantity > 0"
                          class="elevation-0"
                          dense
                        >
                          <v-btn small icon @click="decrementQty(addon)">
                            <v-icon>mdi-minus</v-icon>
                          </v-btn>
                          <span class="px-2">{{ addon.quantity }}</span>
                          <v-btn small icon @click="incrementQty(addon)">
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>
                        </v-btn-toggle>

                        <v-btn
                          v-else
                          icon
                          small
                          color="primary"
                          class="elevation-1"
                          @click="incrementQty(addon)"
                        >
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" :loading="loading" @click="createBooking">
            Create Booking
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </deep-layout>
</template>

<script>
import SelectModel from "@/components/SelectModel.vue";
import SelectVehicle from "@/components/SelectVehicle.vue";
import SelectCustomer from "@/components/SelectCustomer.vue";
import api from "@/plugins/axios";
import DeepLayout from "@/Layouts/DeepLayout.vue";

export default {
  name: "CreateBooking",
  components: { SelectModel, SelectVehicle, SelectCustomer, DeepLayout },
  data() {
    return {
      loading: false,
      formData: {
        model: null,
        vehicle: null,
        customer: null,
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
      },
      rules: {
        required: (v) => !!v || "Required",
      },
      today: new Date().toISOString().substr(0, 10),
      addons: [],
      limit: 10,
      page: 1,
      searchQuery: "",
      total: 0,
      pageCount: 1,
    };
  },
  mounted() {
    this.fetchAddons();
  },
  methods: {
    async createBooking() {
      const {
        model,
        vehicle,
        customer,
        start_date,
        end_date,
        start_time,
        end_time,
      } = this.formData;

      if (
        !model ||
        !customer ||
        !start_date ||
        !end_date ||
        !start_time ||
        !end_time
      ) {
        this.$swal.fire({
          icon: "warning",
          title: "Missing Information",
          text: "Please fill in all required fields.",
        });
        return;
      }

      const selectedAddons = this.addons
        .filter((addon) => addon.quantity && addon.quantity > 0)
        .map((addon) => ({
          addon_id: addon._id,
          quantity: addon.quantity,
        }));

      this.loading = true;
      try {
        const payload = {
          model_id: model.model_id,
          customer_id: customer.customer_id,
          vehicle_id: vehicle?.vehicle_id || null,
          start_date,
          end_date,
          start_time,
          end_time,
          addons: selectedAddons,
        };

        const res = await api.post("/api/booking", payload);

        this.$swal.fire({
          icon: "success",
          title: "Booking Created",
          text: res.data.message,
        });

        this.resetForm();
        this.$router.push("/orders");
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to create booking";
        this.$swal.fire({
          icon: "error",
          title: "Error",
          text: message,
          footer: `<pre style="text-align:left; white-space:pre-wrap;">${
            err.response?.data?.error_stack || ""
          }</pre>`,
          width: 600,
        });
      } finally {
        this.loading = false;
      }
    },

    async fetchAddons() {
      this.loading = true;
      const offset = (this.page - 1) * this.limit;

      try {
        const { data } = await api.get("/api/addons", {
          params: {
            limit: this.limit,
            offset,
            available: true,
            search: this.searchQuery || undefined,
          },
        });

        this.addons = (data?.data?.addons || []).map((addon) => ({
          ...addon,
          quantity: 0,
        }));
        this.total = data?.data?.metadata?.total || 0;
        this.pageCount = Math.ceil(this.total / this.limit) || 1;
      } catch (err) {
        console.error("Addon fetch error:", err);
      } finally {
        this.loading = false;
      }
    },

    incrementQty(addon) {
      addon.quantity = (addon.quantity || 0) + 1;
    },

    decrementQty(addon) {
      if (addon.quantity > 0) addon.quantity--;
    },

    resetForm() {
      this.formData = {
        model: null,
        vehicle: null,
        customer: null,
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
      };
      this.addons.forEach((addon) => {
        addon.quantity = 0;
      });
    },
  },
};
</script>

<style scoped>
label {
  display: block;
  margin-bottom: 4px;
}
</style>
