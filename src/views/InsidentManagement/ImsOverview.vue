<template>
  <deep-layout>
    <v-container fluid>
      <v-row dense>
        <!-- LEFT: Booking + Customer + Tabs -->
        <v-col cols="12" md="4">
          <!-- Booking Info -->
          <v-skeleton-loader v-if="loading" type="card" />
          <v-card v-else outlined class="pa-4 rounded-lg mb-4">
            <div class="text-h6 mb-2 font-weight-bold">Booking Details</div>
            <v-row dense>
              <v-col cols="6" class="grey--text text--darken-1">Order ID</v-col>
              <v-col cols="6" class="font-weight-medium text-right">
                <div v-if="incident.booking_data.order_id">
                  <router-link
                    :to="`/orders/${incident.booking_data.order_id}`"
                    class="primary--text font-weight-bold text-decoration-none d-inline-flex align-center"
                  >
                    {{ incident.booking_data?.order_id || "-" }}
                    <v-icon small color="primary" class="ml-1"
                      >mdi-open-in-new</v-icon
                    >
                  </router-link>
                </div>
              </v-col>
              <v-col cols="6" class="grey--text text--darken-1"
                >Booking ID</v-col
              >
              <v-col cols="6" class="font-weight-medium text-right">
                {{ incident.booking_data?.booking_id || "-" }}
              </v-col>

              <v-col cols="6" class="grey--text text--darken-1">Status</v-col>
              <v-col cols="6" class="font-weight-medium text-right">
                {{ incident.booking_data?.status || "-" }}
              </v-col>

              <v-col cols="6" class="grey--text text--darken-1"
                >Start Date</v-col
              >
              <v-col cols="6" class="font-weight-medium text-right">
                {{ formatDate(incident.booking_data?.start_date) }}
              </v-col>

              <v-col cols="6" class="grey--text text--darken-1">End Date</v-col>
              <v-col cols="6" class="font-weight-medium text-right">
                {{ formatDate(incident.booking_data?.end_date) }}
              </v-col>
            </v-row>
          </v-card>

          <!-- Customer Info -->
          <v-card outlined class="pa-4 rounded-lg mb-4">
            <CustomerViewer
              v-if="incident"
              :customer_id="incident?.customer_id"
            />
          </v-card>

          <v-card outlined class="rounded-lg pa-2">
            <v-tabs v-model="tab" grow>
              <v-tab>Comments</v-tab>
              <v-tab>Status Logs</v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
              <!-- Comments Tab -->
              <v-tab-item>
                <v-card flat class="pa-2">
                  <v-skeleton-loader v-if="loading" type="list-item-two-line" />

                  <div v-else>
                    <div v-if="displayedComments.length">
                      <v-list dense>
                        <v-list-item
                          v-for="comment in displayedComments"
                          :key="comment.incident_comment_id"
                        >
                          <v-list-item-content>
                            <v-list-item-title>
                              <strong>
                                {{ comment.customer_data?.display_name }}:
                              </strong>
                              {{ comment.message }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                              {{ formatDate(comment.created_at) }}
                            </v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list>

                      <div
                        v-if="!showAllComments && hasMoreComments"
                        class="text-center mt-2"
                      >
                        <v-btn
                          small
                          text
                          color="primary"
                          @click="showAllComments = true"
                        >
                          Load All Comments
                        </v-btn>
                      </div>
                    </div>

                    <v-alert
                      v-else
                      type="info"
                      variant="tonal"
                      dense
                      class="mt-2"
                    >
                      No comments available
                    </v-alert>

                    <!-- Add Comment -->
                    <v-textarea
                      v-model="newComment"
                      label="Add a comment"
                      outlined
                      rows="3"
                      dense
                      class="mt-3"
                    />
                    <v-btn
                      color="primary"
                      class="mt-2"
                      small
                      :loading="commentLoading"
                      @click="addComment"
                    >
                      Post Comment
                    </v-btn>
                  </div>
                </v-card>
              </v-tab-item>

              <!-- Status Logs Tab -->
              <v-tab-item>
                <v-card flat class="pa-2">
                  <v-skeleton-loader v-if="loading" type="table" />
                  <div v-else>
                    <div v-if="incident.incident_status_logs?.length">
                      <v-simple-table dense>
                        <thead>
                          <tr>
                            <th>Old Status</th>
                            <th>New Status</th>
                            <th>Changed By</th>
                            <th>Changed At</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="log in incident.incident_status_logs"
                            :key="log.incident_status_log_id"
                          >
                            <td>{{ log.old_status }}</td>
                            <td>{{ log.new_status }}</td>
                            <td>
                              {{ log.changed_by_provider_data?.name || "-" }}
                            </td>
                            <td>{{ formatDate(log.changed_at) }}</td>
                          </tr>
                        </tbody>
                      </v-simple-table>
                    </div>

                    <v-alert
                      v-else
                      type="info"
                      variant="tonal"
                      dense
                      class="mt-2"
                    >
                      No status logs available
                    </v-alert>
                  </div>
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </v-col>

        <!-- RIGHT: Incident Details -->

        <v-col cols="12" md="8">
          <v-skeleton-loader v-if="loading" type="card" />
          <v-card v-else outlined class="pa-4 rounded-lg">
            <div class="d-flex justify-space-between align-center mb-4">
              <div>
                <div class="text-h6 font-weight-bold">
                  Incident {{ incident.incident_no }}
                </div>
                <div class="grey--text">{{ incident.type }}</div>
              </div>
            </div>

            <v-simple-table dense>
              <tbody>
                <tr>
                  <td>Assigned To</td>
                  <td>{{ incident.assigned_to }}</td>
                </tr>
                <tr>
                  <td>Priority</td>
                  <td>{{ incident.priority }}</td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td>
                    <v-chip
                      small
                      :color="getStatusColor(incident.status)"
                      class="text-capitalize white--text"
                    >
                      {{ incident.status }}
                    </v-chip>

                    <v-icon
                      color="primary"
                      small
                      class="ml-2"
                      @click="openStatusDialog = true"
                    >
                      mdi-pencil
                    </v-icon>
                  </td>
                </tr>

                <tr>
                  <td>Description</td>
                  <td>{{ incident.description }}</td>
                </tr>
                <tr>
                  <td>Created At</td>
                  <td>{{ formatDate(incident.created_at) }}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- STATUS UPDATE DIALOG -->
      <v-dialog v-model="openStatusDialog" max-width="400">
        <v-card>
          <v-card-title class="text-h6">Update Incident Status</v-card-title>
          <v-card-text>
            <v-radio-group v-model="tempStatus" column>
              <v-radio
                v-for="status in statusOptions"
                :key="status"
                :label="status.replace('_', ' ')"
                :value="status"
              />
            </v-radio-group>
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn text @click="openStatusDialog = false">Cancel</v-btn>
            <v-btn
              color="primary"
              :loading="statusUpdating"
              @click="updateIncident"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </deep-layout>
</template>

<script>
import api from "@/plugins/axios";
import Swal from "sweetalert2";
import DeepLayout from "@/Layouts/DeepLayout.vue";
import CustomerViewer from "@/components/CustomerViewer.vue";

export default {
  components: { DeepLayout, CustomerViewer },
  data() {
    return {
      incident: null,
      incidentId: null,
      loading: false,

      commentLoading: false,
      newComment: "",
      tab: 0,
      showAllComments: false,
      openStatusDialog: false,
      statusUpdating: false,
      statusOptions: ["open", "in_progress", "resolved", "closed"],
    };
  },
  computed: {
    displayedComments() {
      if (!this.incident?.incident_comments) return [];
      return this.showAllComments
        ? this.incident.incident_comments
        : this.incident.incident_comments.slice(-3);
    },
    hasMoreComments() {
      return this.incident?.incident_comments?.length > 3;
    },
  },
  mounted() {
    this.incidentId = this.$route.params.incident_id;
    this.fetchIncident();
  },
  methods: {
    async fetchIncident() {
      this.loading = true;
      try {
        const { data } = await api.get(`/api/incident/${this.incidentId}`);
        this.incident = data.data || {};
      } catch (err) {
        console.error(err);
        Swal.fire(
          "Error",
          err.response?.data?.message || "Failed to load incident",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },
    openStatusDialogHandler() {
      this.tempStatus = this.incident.status;
      this.openStatusDialog = true;
    },

    async updateIncident() {
      this.statusUpdating = true;
      try {
        await api.put(`/api/incident/${this.incident.incident_id}`, {
          status: this.tempStatus,
        });
        this.incident.status = this.tempStatus;
        this.openStatusDialog = false;
      } catch (err) {
        console.error(err);
      } finally {
        this.statusUpdating = false;
      }
    },
    async addComment() {
      if (!this.newComment.trim()) return;
      this.commentLoading = true;
      try {
        await api.post(`/api/incident/${this.incidentId}/comment`, {
          message: this.newComment,
          customer_id: this.incident.customer_id,
        });
        this.newComment = "";
        this.fetchIncident();
      } catch (err) {
        Swal.fire(
          "Error",
          err.response?.data?.message || "Failed to post comment",
          "error"
        );
      } finally {
        this.commentLoading = false;
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleString();
    },
    getStatusColor(status) {
      switch (status) {
        case "open":
          return "red";
        case "in_progress":
          return "orange";
        case "resolved":
          return "green";
        case "closed":
          return "grey";
        default:
          return "blue";
      }
    },
  },
};
</script>
