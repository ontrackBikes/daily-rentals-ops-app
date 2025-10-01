<template>
  <v-card :loading="loading">
    <v-container>
      <!-- Header -->
      <div class="d-flex justify-space-between align-center">
        <div class="text-h6 font-weight-bold">End Booking</div>
        <v-btn icon @click="$emit('close-modal')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Form -->
      <v-form ref="endFormRef" v-model="endFormValid" class="my-4">
        <!-- Odometer -->
        <label class="text-subtitle-2">
          Odometer Reading <span class="red--text">*</span>
        </label>
        <v-text-field
          v-model="endForm.odometer"
          type="number"
          outlined
          dense
          :rules="[rules.required, rules.numeric]"
          hide-details
        />

        <!-- Images -->
        <label class="text-subtitle-2 mt-3">
          Booking Images (Min 4 required)
        </label>
        <v-row dense>
          <v-col v-for="(img, index) in endImages" :key="index" cols="6" sm="3">
            <v-img
              :src="img.preview || img.image_url"
              aspect-ratio="1"
              class="rounded-lg elevation-1"
              contain
            />
            <div
              class="text-caption mt-1 text-center grey--text text--darken-1"
            >
              {{ img.type || "drop" }}
            </div>
          </v-col>

          <!-- Add Image -->
          <v-col cols="6" sm="3">
            <div
              class="d-flex flex-column align-center justify-center grey lighten-3 rounded-lg"
              style="height: 100px; cursor: pointer"
              @click="triggerImageUpload"
            >
              <v-icon size="36" color="grey darken-1"
                >mdi-plus-circle-outline</v-icon
              >
              <span class="mt-1 text-caption grey--text text--darken-1"
                >Add Image</span
              >
            </div>
          </v-col>
        </v-row>
      </v-form>

      <!-- Actions -->
      <div class="d-flex justify-end my-2">
        <v-btn text rounded @click="$emit('close-modal')" class="mr-2"
          >Cancel</v-btn
        >
        <v-btn
          color="primary"
          :disabled="!endFormValid || endImages.length < 4"
          @click="submitEndBooking"
          rounded
        >
          Confirm
        </v-btn>
      </div>

      <!-- Hidden File Input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        class="d-none"
        @change="handleImageUpload"
      />
    </v-container>
  </v-card>
</template>

<script>
import api from "@/plugins/axios";

export default {
  props: {
    booking: { type: Object, required: true },
  },
  data() {
    return {
      loading: false,
      endFormValid: false,
      endForm: { odometer: "" },
      endImages: [],
      rules: {
        required: (v) => !!v || "Required",
        numeric: (v) => !isNaN(Number(v)) || "Must be a number",
      },
    };
  },
  methods: {
    triggerImageUpload() {
      this.$refs.fileInput.click();
    },
    async handleImageUpload(event) {
      const files = Array.from(event.target.files);
      if (!files.length) return;
      this.loading = true;

      try {
        for (const file of files) {
          const preview = URL.createObjectURL(file);

          const formData = new FormData();
          formData.append("booking_id", this.booking.booking_id);
          formData.append("type", "drop");
          formData.append("image", file, file.name);

          const res = await api.post("/api/bookings/upload-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          this.endImages.push({
            image_url: res.data.image_url || preview,
            preview,
            type: "drop",
            file,
          });
        }
      } catch (err) {
        console.error("Upload failed:", err);
        this.$swal.fire({
          icon: "error",
          title: "Upload failed",
          text: err.response?.data?.message || "Failed to upload images",
        });
      } finally {
        this.loading = false;
        event.target.value = "";
      }
    },
    async submitEndBooking() {
      if (!this.endFormValid || this.endImages.length < 4) return;

      this.loading = true;
      try {
        const resp = await api.post("/api/booking/end", {
          booking_id: this.booking.booking_id,
          post_odometer_reading: this.endForm.odometer,
        });

        this.$swal.fire({
          icon: "success",
          title: "Booking Ended",
          text: resp.data.message,
        });
        this.$emit("refresh-booking");
        this.$emit("close-modal");
      } catch (e) {
        this.$swal.fire({
          icon: "error",
          title: "Error",
          text: e.response?.data?.message || "Some error occurred!",
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
