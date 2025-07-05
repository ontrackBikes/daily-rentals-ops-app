<template>
  <v-app>
    <v-container>
      <!-- status: 'active', verification_status: 'verified' -->

      <section class="my-6">
        <div class="text-subtitle-1 font-weight-medium mb-2">
          Select Customer
        </div>
        <SelectCustomer v-model="selectedCustomer" :params="{}" />

        <div class="result mt-3">
          <div v-if="selectedCustomer">
            <strong>Selected Customer:</strong>
            <pre>{{ selectedCustomer }}</pre>
          </div>
          <div v-else class="ma-5">
            <em>--- No Customer selected ---</em>
          </div>
        </div>
      </section>

      <h1 class="text-h5 mb-6">🚗 Vehicle Selection Demo</h1>

      <!-- ==================== -->
      <!-- 🔷 SelectModel Usage -->
      <!-- ==================== -->

      <!--
        COMPONENT: <SelectModel />

        DESCRIPTION:
        - Allows users to select a vehicle model from available vehicle models.
        - Fetches the list from /api/vehicle-models on dialog open.
        - Shows only models that are 'active' and have available vehicles.

        PROPS:
        - v-model: Object (Selected model will be bound here)

        EVENTS:
        - input(model: Object): Emitted when a model is selected.
      -->
      <section class="my-6">
        <div class="text-subtitle-1 font-weight-medium mb-2">
          Select Vehicle Model
        </div>
        <SelectModel v-model="selectedModel" />

        <div class="result mt-3">
          <div v-if="selectedModel">
            <strong>Selected Model:</strong>
            <pre>{{ selectedModel }}</pre>
          </div>
          <div v-else class="ma-5">
            <em>--- No model selected ---</em>
          </div>
        </div>
      </section>

      <!-- ====================== -->
      <!-- 🔶 SelectVehicle Usage -->
      <!-- ====================== -->

      <!--
        COMPONENT: <SelectVehicle />

        DESCRIPTION:
        - Allows users to select a specific vehicle using search + filters.
        - Fetches from /api/vehicles using params provided via `props`.
        - Supports infinite scrolling or "Load More".

        PROPS:
        - v-model: Object (Selected vehicle will be bound here)
        - :params: Object
            {
              status: "available",       // Filter by status
              search: "honda",           // Optional search term
              limit: 20,                 // Optional limit per load
              offset: 0                  // (auto managed internally)
            }

        EVENTS:
        - input(vehicle: Object): Emitted when a vehicle is selected.
      -->
      <section class="my-6">
        <div class="text-subtitle-1 font-weight-medium mb-2">
          Select Vehicle
        </div>
        <SelectVehicle
          v-model="selectedVehicle"
          :params="{ status: 'available', search: 'honda' }"
        />

        <div class="result mt-3">
          <div v-if="selectedVehicle">
            <strong>Selected Vehicle:</strong>
            <pre>{{ selectedVehicle }}</pre>
          </div>
          <div v-else class="ma-5">
            <em>--- No vehicle selected ---</em>
          </div>
        </div>
      </section>

      <!-- ======================= -->
      <!-- 🟢 SelectLocation Usage -->
      <!-- ======================= -->

      <!--
        COMPONENT: <SelectLocation />

        DESCRIPTION:
        - Allows selection of a provider location.
        - Fetches from /api/locations with filters.
        - Includes search, paginated fetch, and "Load More" support.

        PROPS:
        - v-model: Object (Selected location)
        - :params: Object
            {
              status: "active",          // Optional status filter
              limit: 20,                 // Optional per page
              search: "indiranagar",     // Optional search term
            }

        EVENTS:
        - input(location: Object): Emitted when a location is selected.
      -->
      <section class="my-6">
        <div class="text-subtitle-1 font-weight-medium mb-2">
          Select Location
        </div>
        <SelectLocation
          v-model="selectedLocation"
          :params="{ status: 'active', search: '' }"
        />

        <div class="result mt-3">
          <div v-if="selectedLocation">
            <strong>Selected Location:</strong>
            <pre>{{ selectedLocation }}</pre>
          </div>
          <div v-else class="ma-5">
            <em>--- No location selected ---</em>
          </div>
        </div>
      </section>
    </v-container>
  </v-app>
</template>

<script>
import SelectModel from "./SelectModel.vue";
import SelectVehicle from "./SelectVehicle.vue";
import SelectLocation from "./SelectLocation.vue";
import SelectCustomer from "./SelectCustomer.vue";

export default {
  name: "HelloWorld",
  components: {
    SelectModel,
    SelectVehicle,
    SelectLocation,
    SelectCustomer,
  },
  data() {
    return {
      selectedModel: null,
      selectedVehicle: null,
      selectedLocation: null,
      selectedCustomer: null,
    };
  },
};
</script>

<style scoped>
.result {
  height: auto;
  width: 100%;
  background: #f9f9f9;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  white-space: pre-wrap;
}
</style>
