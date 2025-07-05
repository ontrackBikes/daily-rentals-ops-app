<template>
  <v-card class="pa-4" outlined>
    <h3 class="text-h6 mb-2">Location Map</h3>
    <div v-if="hasCoordinates" style="height: 400px; width: 100%">
      <GmapMap
        :center="{ lat, lng }"
        :zoom="16"
        map-type-id="roadmap"
        :options="mapOptions"
        style="width: 100%; height: 100%"
      >
        <GmapMarker :position="{ lat, lng }" :icon="customIcon" />
      </GmapMap>
    </div>
    <div v-else class="grey--text">Invalid coordinates.</div>
  </v-card>
</template>

<script>
export default {
  name: "GMapMarker",
  props: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  computed: {
    hasCoordinates() {
      return !!this.lat && !!this.lng;
    },
    mapOptions() {
      return {
        styles: [
          {
            featureType: "poi",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#e2e2e2" }],
          },
          {
            featureType: "road",
            elementType: "labels",
            stylers: [{ visibility: "simplified" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#c9e6f3" }],
          },
          {
            featureType: "administrative",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: false,
      };
    },
    customIcon() {
      return {
        url: "https://on-track-jarvis.s3.ap-south-1.amazonaws.com/motor-1751734107678.png", // Top angle motorbike icon
        scaledSize: { width: 56, height: 56 },
        anchor: { x: 18, y: 18 }, // center of the image
      };
    },
  },
};
</script>
