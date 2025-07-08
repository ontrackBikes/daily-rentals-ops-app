<template>
  <v-menu v-model="menu" bottom offset-y>
    <template v-slot:activator="{ attrs }">
      <v-btn
        text
        color="primary"
        dark
        v-bind="attrs"
        @click.stop="menu = !menu"
      >
        <slot></slot>
      </v-btn>
    </template>

    <slot name="content" />
  </v-menu>
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
  props: {
    maxWidth: {
      type: Number,
      default: 500,
    },
  },
  destroyed() {
    // Optional: ensure state is reset
    this.menu = false;
  },
};
</script>
