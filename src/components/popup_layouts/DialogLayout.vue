<template>
  <div>
    <v-btn text class="ma-0 pa-0" color="indigo" @click="menu = true">
      <slot></slot>
    </v-btn>
    <v-dialog v-model="menu" :max-width="maxWidth">
      <template v-slot:default>
        <v-sheet>
          <v-container>
            <div class="d-flex justify-space-between">
              <div class="my-auto"><slot name="title" /></div>
              <v-btn icon color="primary" @click="menu = !menu"
                ><v-icon>mdi-close</v-icon></v-btn
              >
            </div>
          </v-container>
          <slot name="content" />
        </v-sheet>
      </template>
    </v-dialog>
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
<style></style>
