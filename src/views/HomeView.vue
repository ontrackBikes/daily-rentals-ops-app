<template>
  <v-container fluid>
    <v-row v-if="loading" align="center" justify="center" class="my-12">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="48" />
        <p class="mt-3">Loading...</p>
      </v-col>
    </v-row>

    <v-row v-else dense>
      <!-- AUM -->
      <v-col cols="12" md="3">
        <v-card class="pa-4 card-metric" outlined>
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
                Ontrack platform. AUM by count = Total bikes listed. AUM by
                value = Number of Active Vehicles × Avg. Value per Vehicle.
              </span>
            </v-tooltip>
          </div>
          <div class="headline text-center">{{ aumCount }}</div>
          <div class="text-success text-center">
            ₹ {{ formatValue(aumValue) }}
          </div>
        </v-card>
      </v-col>

      <!-- Active Bookings -->
      <v-col cols="12" md="3">
        <v-card class="pa-4 card-metric" outlined>
          <div class="font-weight-bold text-center">Active Bookings</div>
          <div class="headline text-center mt-2">{{ activeBookings }}</div>
          <div class="text-success text-center">85% Utilization</div>
        </v-card>
      </v-col>

      <!-- ADR -->
      <v-col cols="12" md="3">
        <v-card class="pa-4 card-metric" outlined>
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
              <span>Average daily rental price per vehicle.</span>
            </v-tooltip>
          </div>
          <div class="headline text-center">
            ₹ {{ Math.round(averageDailyRate) }}
          </div>
          <div class="text-success text-center">2 ↑</div>
        </v-card>
      </v-col>

      <!-- Utilization -->
      <v-col cols="12" md="3">
        <v-card class="pa-4 card-metric" outlined>
          <div class="font-weight-bold text-center">Utilization</div>
          <div class="headline text-center mt-2">
            {{ Math.round(utilization) }}
          </div>
          <div class="text-success text-center text-caption">
            ↑ 15% vs Last Week
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Chart Section -->
    <v-row class="my-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-2">
          <h6 class="mb-0">Bookings Graph</h6>
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

// Register the components you'll use
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
      selectedView: "Daily",
      chart: null,
    };
  },

  mounted() {
    this.fetchProviderMatrix();
    this.drawChart();
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
        const response = await api.get(
          "/api/operations/provider/dashboard-metrics"
        );
        const data = response.data.data;

        this.aumCount = data.asset_under_management_by_count;
        this.aumValue = data.asset_under_management_by_value;
        this.activeBookings = data.active_bookings;
        this.averageDailyRate = parseFloat(data.average_daily_rate);
        this.utilization = parseFloat(data.utilization);
      } catch (err) {
        console.error("API Error", err);
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

    drawChart() {
      const ctx = this.$refs.chartCanvas.getContext("2d");
      this.chart = new Chart(ctx, {
        type: "line",
        data: this.getChartData("Daily"),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 5 },
            },
          },
        },
      });
    },

    updateChart() {
      const data = this.getChartData(this.selectedView);
      this.chart.data.labels = data.labels;
      this.chart.data.datasets[0].data = data.datasets[0].data;
      this.chart.update();
    },

    getChartData(view) {
      if (view === "Daily") {
        return {
          labels: [
            "07/05/25",
            "08/05/25",
            "09/05/25",
            "10/05/25",
            "11/05/25",
            "12/05/25",
            "13/05/25",
            "14/05/25",
          ],
          datasets: [
            {
              label: "Bookings",
              data: [2, 10, 13, 12, 14, 19, 24, 27],
              borderColor: "#f57c00",
              backgroundColor: "transparent",
              tension: 0.4,
            },
          ],
        };
      } else if (view === "Weekly") {
        return {
          labels: ["Week 1", "Week 2", "Week 3"],
          datasets: [
            {
              label: "Bookings",
              data: [35, 44, 58],
              borderColor: "#f57c00",
              backgroundColor: "transparent",
              tension: 0.4,
            },
          ],
        };
      } else {
        return {
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [
            {
              label: "Bookings",
              data: [100, 120, 130, 145, 170],
              borderColor: "#f57c00",
              backgroundColor: "transparent",
              tension: 0.4,
            },
          ],
        };
      }
    },
  },
};
</script>
