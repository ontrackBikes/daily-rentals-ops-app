<template>
  <v-app>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="pa-5" outlined rounded="lg">
            <!-- Title -->
            <h2 class="text-center mb-6">Provider Login</h2>

            <!-- Form -->
            <v-form ref="loginForm" @submit.prevent="login" lazy-validation>
              <!-- Email -->
              <v-text-field
                v-model="email"
                placeholder="Email"
                type="email"
                :rules="[rules.required, rules.email]"
                outlined
                required
              />

              <!-- Password with toggle -->
              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="showPassword = !showPassword"
                :rules="[rules.required]"
                outlined
                required
              />

              <!-- Submit Button -->
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="loading"
                depressed
                rounded
                class="text-right"
              >
                <v-icon left>mdi-login</v-icon>
                Login
              </v-btn>

              <!-- Error Alert -->
              <v-alert
                v-if="error"
                type="error"
                dense
                class="mt-3"
                border="left"
                colored-border
              >
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
  name: "ProviderLogin",
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      loading: false,
      error: null,
      rules: {
        required: (v) => !!v || "This field is required",
        email: (v) => /.+@.+\..+/.test(v) || "Enter a valid email",
      },
    };
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    },
  },
  created() {
    // Auto-redirect if already logged in
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      this.$router.replace("/");
    }
  },
  methods: {
    async login() {
      if (!this.$refs.loginForm.validate()) return;

      this.loading = true;
      this.error = null;
      try {
        // Call provider login API
        const res = await api.post("/api/provider/auth/login", {
          email: this.email,
          password: this.password,
        });

        // Extract token
        const token = res.data?.data?.token;
        if (!token) throw new Error("Invalid response from server");

        // Save token
        setAuthToken(token);
        localStorage.setItem("authToken", token);

        // Redirect to dashboard
        this.$router.push("/");
      } catch (err) {
        // Handle API or network errors gracefully
        this.error =
          err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
