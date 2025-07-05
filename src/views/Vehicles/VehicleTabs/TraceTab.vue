<template>
  <v-card flat style="position: relative">
    <v-card class="hidden-md-and-up my-4" outlined>
      <v-container>
        <h3>Current Location</h3>
        <p>
          <strong>{{ location.name }}</strong
          ><br />
          {{ location.address }}<br />
          Contact: {{ location.contact_number }}<br />
          Pincode: {{ location.pincode }}
        </p>
        <v-btn
          color="primary"
          outlined
          :href="googleMapsUrl"
          target="_blank"
          rel="noopener"
          class="mt-2"
        >
          <v-icon left>mdi-map-marker-path</v-icon>
          Get Directions
        </v-btn>
      </v-container>
    </v-card>

    <GMapMarker
      :lat="parseFloat(location.latitude)"
      :lng="parseFloat(location.longitude)"
    />

    <v-card
      class="hidden-md-and-down"
      outlined
      style="position: absolute; right: 40px; top: 80px"
      min-width="300px"
    >
      <v-container>
        <h3>Current Location</h3>
        <p>
          <strong>{{ location.name }}</strong
          ><br />
          {{ location.address }}<br />
          Contact: {{ location.contact_number }}<br />
          Pincode: {{ location.pincode }}
        </p>
        <v-btn
          color="primary"
          outlined
          :href="googleMapsUrl"
          target="_blank"
          rel="noopener"
          class="mt-2"
        >
          <v-icon left>mdi-map-marker-path</v-icon>
          Get Directions
        </v-btn>
      </v-container>
    </v-card>
  </v-card>
</template>

<script>
import GMapMarker from "@/components/GMapMarker.vue";

export default {
  name: "TraceTab",
  components: {
    GMapMarker,
  },
  props: {
    vehicle: {
      type: Object,
      required: true,
    },
    location: {
      type: Object,
      required: true,
    },
  },
  computed: {
    googleMapsUrl() {
      const lat = this.location.latitude || "";
      const lng = this.location.longitude || "";
      if (lat && lng) {
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      } else {
        // Fallback to address-based direction
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          this.location.address || ""
        )}`;
      }
    },
  },
};
</script>
