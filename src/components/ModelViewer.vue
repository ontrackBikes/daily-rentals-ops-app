<template>
  <v-menu v-model="menu" :open-on-hover="true" bottom offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        rounded
        depressed
        text
        color="indigo"
        dark
        v-bind="attrs"
        v-on="on"
      >
        <slot></slot>
      </v-btn>
    </template>
    <v-card max-width="400" class="pa-3">
      <v-list-item>
        <v-list-item-avatar tile size="60">
          <v-img :src="model?.image_url" v-if="model?.image_url" />
          <v-icon v-else>mdi-car-info</v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="text-subtitle-1 font-weight-medium">
            {{ model?.model_name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ model?.make }} • {{ model?.year }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider class="my-2" />

      <div class="text-body-2">
        <div><strong>Engine Type:</strong> {{ model?.engine_type }}</div>
        <div><strong>Fuel Capacity:</strong> {{ model?.fuel_capacity }} L</div>
        <div><strong>Seat Capacity:</strong> {{ model?.seat_capacity }}</div>
        <div>
          <strong>Rates:</strong> ₹{{ model?.base_hourly_rate }}/hr, ₹{{
            model?.base_daily_rate
          }}/day
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  name: "ModelViewer",
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      menu: false,
    };
  },
};
</script>
