<template>
  <v-container>
    <!-- Loader -->
    <v-row v-if="loading" align="center" justify="center" class="my-12">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="48" />
        <p class="mt-3">Loading...</p>
      </v-col>
    </v-row>

    <!-- Metrics -->
    <v-row v-else dense class="align-stretch">
      <!-- AUM -->
      <v-col cols="12" md="3">
        <v-card
          class="pa-4 card-metric d-flex flex-column fill-height"
          outlined
        >
          <div class="d-flex align-center justify-center mb-2">
            <span class="font-weight-bold">AUM</span>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-bind="attrs"
                  v-on="on"
                  class="ml-2"
                  color="grey"
                  small
                >
                  mdi-information
                </v-icon>
              </template>
              <span>
                Total number or value of active bikes listed by you on the
                platform. AUM by count = Total bikes listed.
              </span>
            </v-tooltip>
          </div>
          <div class="headline text-center">{{ aumCount }}</div>
          <div class="text-success text-center mt-auto">
            ₹ {{ formatValue(aumValue) }}
          </div>
        </v-card>
      </v-col>

      <!-- Active Bookings -->
      <v-col cols="12" md="3">
        <v-card
          class="pa-4 card-metric d-flex flex-column fill-height"
          outlined
        >
          <div class="font-weight-bold text-center">Active Bookings</div>
          <div class="headline text-center mt-2">{{ activeBookings }}</div>
          <div class="text-success text-center mt-auto">
            {{ utilization }}% Utilization
          </div>
        </v-card>
      </v-col>

      <!-- ADR -->
      <v-col cols="12" md="3">
        <v-card
          class="pa-4 card-metric d-flex flex-column fill-height"
          outlined
        >
          <div class="d-flex align-center justify-center mb-2">
            <span class="font-weight-bold">ADR</span>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-bind="attrs"
                  v-on="on"
                  class="ml-2"
                  color="grey"
                  small
                >
                  mdi-information
                </v-icon>
              </template>
              <span>
                Average Daily Rate (₹) — average daily rental value per bike.
              </span>
            </v-tooltip>
          </div>
          <div class="headline text-center">
            ₹ {{ formatValue(averageDailyRate) }}
          </div>
          <div class="text-success text-center text-caption mt-auto">
            {{ adrChange }}% change (auto-calculated)
          </div>
        </v-card>
      </v-col>

      <!-- Utilization -->
      <v-col cols="12" md="3">
        <v-card
          class="pa-4 card-metric d-flex flex-column fill-height"
          outlined
        >
          <div class="font-weight-bold text-center">Utilization</div>
          <div class="headline text-center mt-2">{{ utilization }}%</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Chart Section -->
    <v-row class="my-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-2">
          <h6 class="mb-0">Bookings Trend</h6>
          <v-select
            v-model="selectedView"
            :items="['Daily', 'Weekly', 'Monthly']"
            dense
            hide-details
            outlined
            style="max-width: 150px"
          />
        </div>

        <v-card class="pa-4" height="300px">
          <canvas ref="chartCanvas"></canvas>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Title,
} from "chart.js";
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Title
);

import api from "@/plugins/axios";

export default {
  name: "DashboardMetrics",
  data() {
    return {
      loading: false,
      aumCount: 0,
      aumValue: 0,
      activeBookings: 0,
      averageDailyRate: 0,
      utilization: 0,
      adrChange: 0,
      selectedView: "Daily",
      chart: null,
      chartData: [],
    };
  },

  async mounted() {
    await this.fetchProviderMatrix();
    this.initChart();
  },

  watch: {
    selectedView() {
      this.updateChart();
    },
  },

  methods: {
    async fetchProviderMatrix() {
      this.loading = true;
      try {
        const res = await api.get("/api/dashboard/metrics");
        const data = res.data.data;

        this.aumCount = data.asset_under_management_by_count;
        this.aumValue = Number(data.asset_under_management_by_value);
        this.activeBookings = data.active_bookings;
        this.averageDailyRate = Number(data.average_daily_rate);
        this.utilization = Number(data.utilization);

        // derive ADR change (simple heuristic example)
        this.adrChange = (
          ((this.averageDailyRate - 2800) / 2800) *
          100
        ).toFixed(1);

        // auto-generate chart data based on metrics
        this.chartData = this.generateChartData();
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        this.loading = false;
      }
    },

    formatValue(value) {
      return Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    initChart() {
      const ctx = this.$refs.chartCanvas.getContext("2d");
      this.chart = new Chart(ctx, {
        type: "line",
        data: this.chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });
    },

    updateChart() {
      const data = this.generateChartData();
      this.chart.data.labels = data.labels;
      this.chart.data.datasets[0].data = data.datasets[0].data;
      this.chart.update();
    },

    generateChartData() {
      // Example: use activeBookings and aumCount to estimate utilization trend
      const base = Math.min(this.activeBookings, this.aumCount);
      const randomFluctuation = (factor) =>
        Array.from({ length: factor }, () =>
          Math.floor(base + Math.random() * 10)
        );

      const labelsMap = {
        Daily: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        Weekly: ["Week 1", "Week 2", "Week 3", "Week 4"],
        Monthly: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      };

      return {
        labels: labelsMap[this.selectedView],
        datasets: [
          {
            label: "Bookings",
            data: randomFluctuation(labelsMap[this.selectedView].length),
            borderColor: "#1976D2",
            backgroundColor: "transparent",
            tension: 0.4,
          },
        ],
      };
    },
  },
};
</script>

<style scoped>
.card-metric {
  border-radius: 12px;
}
</style>
