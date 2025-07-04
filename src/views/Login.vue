<template>
  <v-app>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="6" md="4">
          <v-card class="pa-6">
            <v-card-title class="headline">Provider Login</v-card-title>
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
              />
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                required
              />
              <v-btn type="submit" color="primary" :loading="loading">
                Login
              </v-btn>
              <v-alert v-if="error" type="error" dense class="mt-3">
                {{ error }}
              </v-alert>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import api, { setAuthToken } from "@/plugins/axios";

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      error: null,
    };
  },
  created() {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      this.$router.replace("/"); // already logged in
    }
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/api/provider/auth/login", {
          email: this.email,
          password: this.password,
        });
        console.log("🚀 ~ login ~ res:", res);

        const token = res.data.data.token;
        console.log("🚀 ~ login ~ token:", token);
        setAuthToken(token);
        localStorage.setItem("authToken", token);

        this.$router.push("/");
      } catch (err) {
        this.error = err.response?.data?.message || "Login failed";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
