<template>
  <v-card :loading="loading">
    <v-container>
      <!-- Header -->
      <div class="d-flex justify-space-between align-center">
        <div class="text-h6 font-weight-bold">Start Booking</div>
        <v-btn icon @click="$emit('close-modal')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Step Form -->
      <v-form ref="startFormRef" v-model="startFormValid" class="my-4">
        <!-- Step 1: Odometer -->
        <div v-if="step === 1">
          <label class="text-subtitle-2">
            Odometer Reading <span class="red--text">*</span>
          </label>
          <v-text-field
            v-model="startForm.odometer"
            type="number"
            outlined
            dense
            :rules="[rules.required, rules.numeric]"
            hide-details
          />

          <div class="text-right">
            <v-btn color="primary" @click="nextStep">Next</v-btn>
          </div>
        </div>

        <!-- Step 2: Images -->
        <div v-if="step === 2">
          <label class="text-subtitle-2 mt-3">
            Booking Images (Min 4 required)
          </label>
          <v-row dense>
            <v-col
              v-for="(img, index) in startImages"
              :key="index"
              cols="6"
              sm="3"
            >
              <v-img
                :src="img.preview || img.image_url"
                aspect-ratio="1"
                class="rounded-lg elevation-1"
                contain
              />
              <div class="text-caption mt-1 text-center grey--text">
                {{ img.type || "pickup" }}
              </div>
              <v-btn small color="red" class="mt-1" @click="removeImage(index)">
                Remove
              </v-btn>
            </v-col>

            <!-- Add Image -->
            <v-col cols="6" sm="3">
              <div
                class="d-flex flex-column align-center justify-center grey lighten-3 rounded-lg"
                style="height: 100px; cursor: pointer"
                @click="triggerImageUpload"
              >
                <v-icon size="36" color="grey darken-1">
                  mdi-plus-circle-outline
                </v-icon>
                <span class="mt-1 text-caption grey--text">Add Image</span>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-form>

      <!-- Actions -->
      <div class="d-flex justify-end my-2">
        <v-btn text @click="$emit('close-modal')" class="mr-2">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="!startFormValid || startImages.length < 4"
          @click="submitStartBooking"
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
      step: 1,
      loading: false,
      startFormValid: false,
      startForm: { odometer: "" },
      startImages: [],
      currentUploadType: "start",
      rules: {
        required: (v) => !!v || "Required",
        numeric: (v) => !isNaN(Number(v)) || "Must be a number",
      },
    };
  },
  methods: {
    nextStep() {
      if (this.$refs.startFormRef.validate()) {
        this.step++;
      }
    },
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
          formData.append("type", "pickup");
          formData.append("image", file, file.name);

          const res = await api.post("/api/bookings/upload-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          this.startImages.push({
            image_url: res.data.image_url || preview,
            preview,
            type: "pickup",
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
    removeImage(index) {
      this.startImages.splice(index, 1);
    },
    async submitStartBooking() {
      if (!this.startFormValid || this.startImages.length < 4) return;

      this.loading = true;
      try {
        const resp = await api.post("/api/booking/start", {
          booking_id: this.booking.booking_id,
          pre_odometer_reading: this.startForm.odometer,
        });

        this.$swal.fire({
          icon: "success",
          title: "Started",
          text: resp.data.message,
        });
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
