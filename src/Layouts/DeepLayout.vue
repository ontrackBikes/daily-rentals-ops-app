<template>
  <v-app>
    <v-app-bar app flat>
      <v-btn @click="handleBack" icon>
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ $route.name }}</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <slot></slot>
    </v-main>
  </v-app>
</template>

<script>
export default {
  props: {
    backTo: {
      type: [String, Object, Number],
      default: -1, // default same as $router.go(-1)
    },
  },
  methods: {
    handleBack() {
      if (typeof this.backTo === "number") {
        this.$router.go(this.backTo);
      } else {
        this.$router.push(this.backTo);
      }
    },
  },
};
</script>
