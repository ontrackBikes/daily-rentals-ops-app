<template>
  <div>
    <!-- File Input -->
    <v-file-input
      v-model="selectedFile"
      label="Upload Image"
      accept="image/*"
      prepend-icon="mdi-camera"
      outlined
      dense
      :disabled="loading"
      @change="uploadImage"
    ></v-file-input>

    <!-- Loader -->
    <div v-if="loading" class="d-flex justify-center mt-3">
      <v-progress-circular indeterminate color="primary" size="32" />
    </div>

    <!-- Snackbar for messages -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="4000"
      top
      right
    >
      {{ snackbar.message }}
      <v-btn icon @click="snackbar.show = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "UploadImage",
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      selectedFile: null,
      previewUrl: null,
      loading: false,
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },
  watch: {
    selectedFile(file) {
      if (file) {
        this.previewUrl = URL.createObjectURL(file);
      } else {
        this.previewUrl = null;
      }
    },
  },
  methods: {
    async uploadImage() {
      if (!this.selectedFile) {
        this.showSnackbar("Please select an image to upload", "error");
        return;
      }

      const formData = new FormData();
      formData.append("image", this.selectedFile);
      formData.append("type", this.type);

      this.loading = true;

      try {
        const { data } = await api.post(
          "/api/document/upload-image",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (data.success) {
          this.showSnackbar("Image uploaded successfully", "success");
          this.$emit("uploaded", data.data.url);
        } else {
          this.showSnackbar(data.message || "Upload failed", "error");
        }
      } catch (err) {
        console.error("Upload error:", err);
        const msg =
          err.response?.data?.message ||
          "Something went wrong while uploading. Please try again.";
        this.showSnackbar(msg, "error");
      } finally {
        this.loading = false;
      }
    },

    showSnackbar(message, color) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

<style scoped>
.v-snackbar {
  z-index: 9999;
}
</style>
