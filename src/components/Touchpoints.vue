<template>
  <v-card rounded="lg" outlined class="pa-4 mt-2">
    <!-- Header -->
    <div class="font-weight-bold mb-2 d-flex align-center">
      <v-icon left>mdi-comment-multiple</v-icon>
      Touchpoints
    </div>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      dense
      outlined
      dismissible
      class="mb-4"
      @input="error = null"
    >
      {{ error }}
    </v-alert>

    <!-- Add/Edit Comment Box -->
    <div class="pa-2">
      <v-text-field
        v-show="!editingComment"
        v-model="booking_Id"
        outlined
        dense
        hide-details="auto"
        label="Booking ID (Optional)"
        placeholder="Attach to a booking"
        class="mb-3"
        :disabled="!!bookingId"
      />

      <v-textarea
        v-model="newComment"
        outlined
        dense
        rows="2"
        hide-details="auto"
        :label="editingComment ? 'Edit Comment' : 'Add New Comment'"
        placeholder="Write your comment..."
      />

      <div class="d-flex mt-1 justify-end">
        <v-btn
          v-if="editingComment"
          small
          rounded
          text
          color="grey"
          @click="cancelEdit"
        >
          Cancel
        </v-btn>
        <v-btn
          small
          rounded
          color="primary"
          :disabled="!newComment.trim()"
          :loading="submitting"
          @click="editingComment ? updateComment() : addComment()"
        >
          <v-icon left small>mdi-send</v-icon>
          {{ editingComment ? "Update" : "Add" }}
        </v-btn>
      </div>
    </div>

    <!-- Comments Header -->
    <div
      v-if="total > 0"
      class="d-flex justify-space-between align-center mb-2"
    >
      <div>Comments History ({{ total }})</div>
    </div>

    <!-- Skeleton Loader -->
    <v-skeleton-loader
      v-if="loading"
      type="list-item@3"
      class="mb-4"
      boilerplate
    />

    <!-- Timeline -->
    <v-card v-if="total > 0" outlined class="pa-2" v-lazy="lazyOptions">
      <v-timeline dense align-top class="mb-0">
        <v-timeline-item
          v-for="comment in displayedComments"
          :key="comment.comment_id"
          small
          :color="
            editingComment?.comment_id === comment.comment_id
              ? 'primary'
              : 'grey lighten-2'
          "
        >
          <v-card
            rounded="lg"
            :outlined="editingComment?.comment_id !== comment.comment_id"
          >
            <div class="px-2">
              <div class="d-flex justify-space-between align-start">
                <p class="mb-0 text-body2">{{ comment.comment }}</p>
                <v-btn
                  v-if="editingComment?.comment_id !== comment.comment_id"
                  icon
                  x-small
                  @click="startEdit(comment)"
                >
                  <v-icon x-small>mdi-pencil</v-icon>
                </v-btn>
              </div>
              <span class="text-caption text-grey--text">
                <small>{{ formatDate(comment.created_at) }}</small>
              </span>
            </div>
          </v-card>
        </v-timeline-item>
      </v-timeline>

      <!-- Load More -->
      <div v-if="hasMore && !loading" class="text-center mt-2">
        <v-btn x-small outlined color="primary" @click="loadMore">
          Load More
        </v-btn>
      </div>
    </v-card>

    <!-- Empty State -->
    <div v-else class="text-center py-2 text-grey">
      <v-icon large>mdi-comment-off</v-icon>
      <div class="subtitle-2">No comments yet</div>
    </div>
  </v-card>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "TouchPoints",
  props: {
    customerId: {
      type: [String, Number],
      required: true,
    },
    bookingId: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      total: 0,
      comments: [],
      booking_Id: "",
      newComment: "",
      loading: false,
      submitting: false,
      error: null,
      editingComment: null,
      displayCount: 3,
      loadStep: 5,
      lazyOptions: { threshold: 0.3 },
    };
  },
  computed: {
    displayedComments() {
      return this.comments.slice(0, this.displayCount);
    },
    hasMore() {
      return this.comments.length > this.displayCount;
    },
  },
  watch: {
    customerId: {
      immediate: true,
      handler() {
        this.fetchComments();
      },
    },
    bookingId: {
      immediate: true,
      handler(newVal) {
        this.booking_Id = newVal ? String(newVal) : "";
      },
    },
  },
  methods: {
    async fetchComments() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get(`/api/customer/${this.customerId}/comments`);
        const list = res.data?.data?.comments || [];
        this.comments = list.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        this.total = res.data?.data?.meta?.total || list.length;
        this.displayCount = Math.min(this.displayCount, this.comments.length);
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to load comments.";
      } finally {
        this.loading = false;
      }
    },

    async addComment() {
      if (!this.newComment.trim()) return;
      this.submitting = true;
      this.error = null;
      try {
        await api.post(`/api/customer/${this.customerId}/comment`, {
          comment: this.newComment.trim(),
          booking_id: this.bookingId || null,
        });
        this.newComment = "";
        if (!this.bookingId) this.booking_Id = "";
        await this.fetchComments();
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to add comment.";
      } finally {
        this.submitting = false;
      }
    },

    startEdit(comment) {
      this.editingComment = comment;
      this.newComment = comment.comment;
    },

    cancelEdit() {
      this.editingComment = null;
      this.newComment = "";
    },

    async updateComment() {
      if (!this.newComment.trim()) return;
      this.submitting = true;
      this.error = null;
      try {
        await api.put(`/api/comment/${this.editingComment.comment_id}`, {
          comment: this.newComment.trim(),
        });
        this.editingComment = null;
        this.newComment = "";
        await this.fetchComments();
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to update comment.";
      } finally {
        this.submitting = false;
      }
    },

    loadMore() {
      this.displayCount += this.loadStep;
    },

    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleString("en-IN", {
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
