<template>
  <v-row class="pa-4" dense>
    <!-- Images List -->
    <v-col cols="12">
      <v-row dense>
        <!-- Image cards -->
        <v-col
          v-for="(image, index) in booking.images || []"
          :key="index"
          cols="6"
          sm="3"
        >
          <v-img
            :src="image.url"
            aspect-ratio="1"
            class="rounded-lg elevation-1"
            contain
          />
          <!-- Type label -->
          <div class="text-caption mt-1 text-center grey--text text--darken-1">
            {{ image.type || "N/A" }}
          </div>
        </v-col>

        <!-- Add Image Button -->
        <v-col cols="6" sm="3">
          <div
            class="d-flex flex-column align-center justify-center grey lighten-3 rounded-lg"
            style="height: 100px; cursor: pointer"
            @click="openImageUploadDialog = true"
          >
            <v-icon size="36" color="grey darken-1"
              >mdi-plus-circle-outline</v-icon
            >
            <span class="mt-1 text-caption grey--text text--darken-1">
              Add Image
            </span>
          </div>
        </v-col>
      </v-row>
    </v-col>

    <!-- Add Image Dialog -->
    <v-dialog v-model="openImageUploadDialog" max-width="400px">
      <v-card :loading="loading">
        <v-container>
          <!-- Header -->
          <div class="d-flex justify-space-between align-center">
            <div class="text-h6 font-weight-bold">Add Booking Image</div>
            <v-btn icon @click="openImageUploadDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Form -->
          <div class="my-4">
            <v-form ref="form" v-model="formValid">
              <!-- Type -->
              <label class="text-subtitle-2"
                >Type <span class="red--text">*</span></label
              >
              <div class="mb-3">
                <v-select
                  v-model="form.type"
                  :items="typeOptions"
                  item-text="text"
                  item-value="value"
                  label="Select Type"
                  outlined
                  dense
                  hide-details
                  :rules="[rules.required]"
                />
              </div>

              <!-- Image -->
              <label class="text-subtitle-2"
                >Image <span class="red--text">*</span></label
              >
              <div class="mb-3">
                <v-file-input
                  v-model="form.image"
                  accept="image/*"
                  :rules="[rules.required]"
                  label="Select Image"
                  outlined
                  dense
                  hide-details
                  prepend-icon=""
                />
              </div>
            </v-form>
          </div>

          <!-- Actions -->
          <div class="d-flex justify-end my-2">
            <v-btn text @click="openImageUploadDialog = false" class="mr-2">
              Cancel
            </v-btn>
            <v-btn color="primary" :disabled="!formValid" @click="uploadImage">
              Upload
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "ImagesTab",
  props: {
    booking: Object,
  },
  data() {
    return {
      openImageUploadDialog: false,
      loading: false,
      formValid: false,
      typeOptions: [
        { text: "Drop", value: "drop" },
        { text: "Pick", value: "pick" },
      ],
      form: {
        type: "",
        image: null,
      },
      rules: {
        required: (v) => !!v || "This field is required",
      },
    };
  },
  methods: {
    async uploadImage() {
      const valid = await this.$refs.form.validate();
      if (!valid) return;

      this.loading = true;
      const formData = new FormData();
      formData.append("booking_id", this.booking.booking_id);
      formData.append("type", this.form.type);
      formData.append("image", this.form.image);

      try {
        const { data } = await api.post("/api/bookings/images", formData);

        // Update booking image list
        // eslint-disable-next-line vue/no-mutating-props
        this.booking.images = [...(this.booking.images || []), data.image];

        // Reset form and close
        this.form = { type: "", image: null };
        this.$refs.form.reset();
        this.openImageUploadDialog = false;

        this.$toast?.success("Image uploaded successfully!");
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to upload image.");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
