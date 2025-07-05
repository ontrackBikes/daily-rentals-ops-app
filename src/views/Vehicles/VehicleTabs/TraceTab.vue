<template>
  <v-container fluid>
    <GMapMarker :lat="12.935" :lng="77.614" />
  </v-container>
</template>

<script>
import GMapMarker from "@/components/GMapMarker.vue";

export default {
  name: "TraceTab",
  components: {
    GMapMarker,
  },
};
</script>
