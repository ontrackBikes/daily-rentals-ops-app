<template>
  <div>
    <v-btn text color="indigo" dark @click="menu = true">
      <slot></slot>
    </v-btn>
    <v-bottom-sheet v-model="menu">
      <template v-slot:default>
        <v-sheet>
          <slot name="content" />
        </v-sheet>
      </template>
    </v-bottom-sheet>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menu: false,
    };
  },
  watch: {
    menu(val) {
      if (!val) {
        // You can emit an event or clean up here if needed
        // Optional: emit to parent or reset internal data
      }
    },
  },
  destroyed() {
    // Optional: ensure state is reset
    this.menu = false;
  },
};
</script>
