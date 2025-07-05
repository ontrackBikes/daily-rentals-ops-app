<template>
  <v-app>
    <v-app-bar app flat>
      <v-btn @click="$router.go(-1)" icon>
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ $route.name }}</v-toolbar-title>
    </v-app-bar>
    <v-main><slot></slot></v-main>
  </v-app>
</template>

<script>
export default {};
</script>

<style></style>
