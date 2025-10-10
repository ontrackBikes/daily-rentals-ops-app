<template>
  <v-container>
    <v-card flat class="pa-4">
      <!-- Filters & Actions -->
      <div class="d-flex justify-space-between mb-4">
        <v-select
          v-model="serviceType"
          :items="['delivery', 'pickup']"
          label="Filter by Service Type"
          dense
          outlined
          hide-details
          style="max-width: 220px"
          @change="fetchPincodes"
          class="rounded-lg"
        />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search by pincode"
          hide-details
          dense
          outlined
          clearable
          style="max-width: 250px"
          class="rounded-lg mr-2"
          @input="debouncedSearch"
        />
        <v-btn color="primary" rounded @click="bulkDialog = true">
          Add Bulk Pincodes
        </v-btn>
      </div>

      <!-- Pincode Table -->
      <v-data-table
        :headers="pincodeHeaders"
        :items="pincodes"
        :loading="pincodeLoading"
        class="elevation-2 rounded-lg"
        hide-default-footer
      >
        <template v-slot:[`item.is_pickup_serviceable`]="{ item }">
          <v-chip
            x-small
            :color="item.is_pickup_serviceable ? 'success' : 'error'"
            dark
          >
            {{ item.is_pickup_serviceable ? "Yes" : "No" }}
          </v-chip>
        </template>

        <template v-slot:[`item.is_delivery_serviceable`]="{ item }">
          <v-chip
            x-small
            :color="item.is_delivery_serviceable ? 'success' : 'error'"
            dark
          >
            {{ item.is_delivery_serviceable ? "Yes" : "No" }}
          </v-chip>
        </template>

        <template v-slot:[`item.createdAt`]="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon small color="primary" @click="openEditDialog(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>

        <template #no-data>
          <v-alert border="left" color="blue lighten-5" class="ma-4">
            <v-icon color="primary" class="mr-2">mdi-information</v-icon>
            No serviceable pincodes found.
          </v-alert>
        </template>
      </v-data-table>
    </v-card>

    <!-- Bulk Add Dialog -->
    <v-dialog v-model="bulkDialog" max-width="900px">
      <v-card>
        <v-card-title>
          <span class="text-h6">Add Serviceable Pincodes</span>
          <v-spacer />
          <v-btn icon @click="closeBulkDialog"
            ><v-icon>mdi-close</v-icon></v-btn
          >
        </v-card-title>

        <v-card-text>
          <v-simple-table dense class="no-divider-table">
            <thead>
              <tr>
                <th>Pincode</th>
                <th>Pickup</th>
                <th>Pickup Amount</th>
                <th>Delivery</th>
                <th>Delivery Amount</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in bulkPincodes" :key="index">
                <td>
                  <v-text-field
                    v-model="row.pincode"
                    dense
                    outlined
                    hide-details
                    placeholder="e.g. 560001"
                    class="ma-0 pa-0"
                    :rules="[(v) => !!v || 'Required']"
                  />
                </td>
                <td>
                  <v-checkbox
                    v-model="row.is_pickup_serviceable"
                    dense
                    hide-details
                    class="ma-0 pa-0"
                  />
                </td>
                <td>
                  <v-text-field
                    v-model.number="row.pickup_amount"
                    type="number"
                    dense
                    outlined
                    hide-details
                    min="0"
                    class="ma-0 pa-0"
                    :disabled="!row.is_pickup_serviceable"
                  />
                </td>
                <td>
                  <v-checkbox
                    v-model="row.is_delivery_serviceable"
                    dense
                    hide-details
                    class="ma-0 pa-0"
                  />
                </td>
                <td>
                  <v-text-field
                    v-model.number="row.delivery_amount"
                    type="number"
                    dense
                    outlined
                    hide-details
                    min="0"
                    class="ma-0 pa-0"
                    :disabled="!row.is_delivery_serviceable"
                  />
                </td>
                <td>
                  <v-checkbox
                    v-model="row.is_active"
                    dense
                    hide-details
                    class="ma-0 pa-0"
                  />
                </td>
                <td>
                  <v-btn icon small color="red" @click="removeRow(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-simple-table>

          <v-btn small color="primary" outlined class="mt-3" @click="addRow">
            <v-icon left>mdi-plus</v-icon>Add Pincode
          </v-btn>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text color="primary" @click="closeBulkDialog">Cancel</v-btn>
          <v-btn color="success" :loading="bulkLoading" @click="submitBulk"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Pincode Dialog -->
    <v-dialog v-model="editPincodeDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <h3>Edit Pincode</h3>
          <v-spacer />
          <v-btn icon @click="editPincodeDialog = false"
            ><v-icon>mdi-close</v-icon></v-btn
          >
        </v-card-title>

        <v-card-text>
          <v-form ref="editForm" v-model="editFormValid">
            <v-text-field
              v-model="editPincodeData.pincode"
              label="Pincode"
              outlined
              dense
              :rules="[(v) => !!v || 'Pincode is required']"
              hide-details="auto"
            />
            <v-checkbox
              v-model="editPincodeData.is_pickup_serviceable"
              label="Pickup Serviceable"
            />
            <v-text-field
              v-model.number="editPincodeData.pickup_amount"
              label="Pickup Amount"
              outlined
              dense
              type="number"
              min="0"
              :disabled="!editPincodeData.is_pickup_serviceable"
              :rules="[(v) => v !== '' || 'Required']"
              hide-details="auto"
            />
            <v-checkbox
              v-model="editPincodeData.is_delivery_serviceable"
              label="Delivery Serviceable"
            />
            <v-text-field
              v-model.number="editPincodeData.delivery_amount"
              label="Delivery Amount"
              outlined
              dense
              type="number"
              min="0"
              :disabled="!editPincodeData.is_delivery_serviceable"
              :rules="[(v) => v !== '' || 'Required']"
              hide-details="auto"
            />
            <v-checkbox v-model="editPincodeData.is_active" label="Active" />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text color="primary" @click="editPincodeDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="success" :loading="editLoading" @click="updatePincode">
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/plugins/axios";
import Swal from "sweetalert2";
import debounce from "lodash/debounce";

export default {
  data() {
    return {
      locationId: this.$route.params.location_id,
      serviceType: "delivery",
      search: "",
      pincodes: [],
      pincodeLoading: false,

      pincodeHeaders: [
        { text: "Pincode", value: "pincode" },
        { text: "Pickup ", value: "is_pickup_serviceable" },
        { text: "Pickup Amount", value: "pickup_amount" },
        { text: "Delivery ", value: "is_delivery_serviceable" },
        { text: "Delivery Amount", value: "delivery_amount" },
        { text: "Active", value: "is_active" },
        { text: "Created At", value: "createdAt" },
        { text: "Actions", value: "actions", sortable: false },
      ],

      bulkDialog: false,
      bulkPincodes: [
        {
          pincode: "",
          is_pickup_serviceable: false,
          pickup_amount: 0,
          is_delivery_serviceable: true,
          delivery_amount: 0,
          is_active: true,
        },
      ],
      bulkLoading: false,

      editPincodeDialog: false,
      editPincodeData: {},
      editLoading: false,
      editFormValid: false,
    };
  },

  mounted() {
    this.fetchPincodes();
  },

  methods: {
    /** Debounce search to reduce API calls */
    debouncedSearch: debounce(function () {
      this.fetchPincodes();
    }, 400),

    async fetchPincodes() {
      this.pincodeLoading = true;
      try {
        const { data } = await api.get(
          `/api/location/${this.locationId}/serviceable-pincodes`,
          { params: { limit: 10, offset: 0, search: this.search || undefined } }
        );

        const allPincodes = data.data?.serviceablePincodes || [];
        this.pincodes = allPincodes.filter((p) =>
          this.serviceType === "pickup"
            ? p.is_pickup_serviceable
            : p.is_delivery_serviceable
        );
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to load pincodes", "error");
      } finally {
        this.pincodeLoading = false;
      }
    },
    closeBulkDialog() {
      this.bulkDialog = false;
      this.resetBulkDialog();
    },
    resetBulkDialog() {
      this.bulkPincodes = [
        {
          pincode: "",
          is_pickup_serviceable: false,
          pickup_amount: 0,
          is_delivery_serviceable: true,
          delivery_amount: 0,
          is_active: true,
        },
      ];
    },

    addRow() {
      this.bulkPincodes.push({
        pincode: "",
        is_pickup_serviceable: true,
        pickup_amount: 0,
        is_delivery_serviceable: true,
        delivery_amount: 0,
        is_active: true,
      });
    },

    removeRow(index) {
      this.bulkPincodes.splice(index, 1);
    },

    async submitBulk() {
      if (!this.bulkPincodes.length) {
        return Swal.fire("Error", "Add at least one pincode", "error");
      }

      for (const row of this.bulkPincodes) {
        if (!row.pincode) {
          return Swal.fire("Error", "Pincode cannot be empty", "error");
        }
        if (!row.is_pickup_serviceable && !row.is_delivery_serviceable) {
          return Swal.fire(
            "Error",
            `Pincode ${row.pincode} must be pickup or delivery serviceable`,
            "error"
          );
        }
        if (row.pickup_amount < 0 || row.delivery_amount < 0) {
          return Swal.fire("Error", "Amounts cannot be negative", "error");
        }
      }

      const payload = {
        location_ids: [this.locationId],
        pincodes: this.bulkPincodes.map((p) => ({
          pincode: p.pincode,
          is_pickup_serviceable: p.is_pickup_serviceable,
          is_delivery_serviceable: p.is_delivery_serviceable,
          pickup_amount: p.is_pickup_serviceable ? p.pickup_amount : 0,
          delivery_amount: p.is_delivery_serviceable ? p.delivery_amount : 0,
          is_active: p.is_active,
        })),
      };

      this.bulkLoading = true;
      try {
        const { data } = await api.post(
          "/api/serviceable-pincode/bulk",
          payload
        );
        Swal.fire({
          icon: "success",
          title: "Pincodes Added",
          html: `
            Added: ${data.data.added}<br/>
            Skipped: ${data.data.skipped}<br/>
            Total Requested: ${data.data.total_requested}
          `,
        });
        this.bulkDialog = false;
        this.bulkPincodes = [];
        this.fetchPincodes();
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to add pincodes", "error");
      } finally {
        this.bulkLoading = false;
      }
    },

    openEditDialog(item) {
      this.editPincodeData = { ...item };
      this.editPincodeDialog = true;
    },

    async updatePincode() {
      if (!this.$refs.editForm.validate()) return;

      if (
        !this.editPincodeData.pincode ||
        (!this.editPincodeData.is_pickup_serviceable &&
          !this.editPincodeData.is_delivery_serviceable)
      ) {
        return Swal.fire("Error", "All fields are mandatory", "error");
      }

      this.editLoading = true;
      try {
        await api.put(`/api/serviceable-pincode/${this.editPincodeData.id}`, {
          location_id: this.locationId,
          pincode: this.editPincodeData.pincode,
          is_pickup_serviceable: this.editPincodeData.is_pickup_serviceable,
          is_delivery_serviceable: this.editPincodeData.is_delivery_serviceable,
          pickup_amount: this.editPincodeData.is_pickup_serviceable
            ? this.editPincodeData.pickup_amount
            : 0,
          delivery_amount: this.editPincodeData.is_delivery_serviceable
            ? this.editPincodeData.delivery_amount
            : 0,
          is_active: this.editPincodeData.is_active,
        });

        Swal.fire("Success", "Pincode updated successfully", "success");
        this.editPincodeDialog = false;
        this.fetchPincodes();
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to update pincode", "error");
      } finally {
        this.editLoading = false;
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
  },
};
</script>

<style scoped>
.no-divider-table {
  border-collapse: collapse;
  width: 100%;
}

.no-divider-table th,
.no-divider-table td {
  /* border: none !important; */
  padding: 8px;
}
</style>
