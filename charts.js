class DashboardCharts {
  constructor(api) {
    this.api = api;
    this.charts = {};
    this.initCharts();
  }

  async initCharts() {
    await this.loadCharts();
    // Refresh charts every 5 minutes
    setInterval(() => this.loadCharts(), 5 * 60 * 1000);
  }

  async loadCharts() {
    try {
      console.log('Loading charts...');

      const atlasData = await this.getHistoryData(
        this.api.entities.pv_atlas,
        '24h'
      );
      console.log('ATLAS data points:', atlasData.length);
      this.renderProductionChart('chart-atlas-production', atlasData, 'ATLAS', '#efefef');

      const heliosData = await this.getHistoryData(
        this.api.entities.pv_helios,
        '24h'
      );
      console.log('HELIOS data points:', heliosData.length);
      this.renderProductionChart('chart-helios-production', heliosData, 'HELIOS', '#cfcfcf');

      const socData = await this.getHistoryData(
        this.api.entities.battery_soc,
        '24h'
      );
      console.log('SOC data points:', socData.length);
      this.renderSocChart('chart-battery-soc', socData);
    } catch (error) {
      console.error('Error loading charts:', error);
    }
  }

  async getHistoryData(entityId, period = '24h') {
    try {
      const url = `${this.api.url}/api/history/period/${period}?filter_entity_ids=${entityId}`;
      console.log(`Fetching history from: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.api.token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`Raw response for ${entityId}:`, JSON.stringify(data).substring(0, 200));

      // Handle different response formats
      let historyArray = null;

      if (Array.isArray(data)) {
        // Response is an array directly
        historyArray = data;
      } else if (typeof data === 'object' && data !== null) {
        // Response is an object - try to find the entity's array
        historyArray = data[entityId] || Object.values(data)[0];
      }

      if (historyArray && Array.isArray(historyArray) && historyArray.length > 0) {
        const mapped = historyArray.map(item => ({
          timestamp: new Date(item.last_changed).getTime(),
          value: parseFloat(item.state) || 0,
        }));
        console.log(`Mapped ${mapped.length} data points for ${entityId}`);
        return mapped;
      } else {
        console.warn(`No valid history array found for ${entityId}`, { historyArray });
        return [];
      }
    } catch (error) {
      console.error(`Error fetching history for ${entityId}:`, error);
      return [];
    }
  }

  renderProductionChart(elementId, data, title, color) {
    if (!data || data.length === 0) {
      console.warn(`No data for ${title}`);
      return;
    }

    console.log(`Rendering ${title} chart with ${data.length} points`);
    const chartData = data.map(item => [item.timestamp, item.value]);

    const options = {
      chart: {
        type: 'area',
        height: 300,
        background: 'transparent',
        foreColor: '#cfcfcf',
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 700,
        },
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      grid: {
        borderColor: 'rgba(255,255,255,0.08)',
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: '#8f8f8f',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#8f8f8f',
          },
        },
        title: {
          text: 'Power (W)',
          style: {
            color: '#8f8f8f',
          },
        },
      },
      tooltip: {
        shared: true,
        x: {
          format: 'HH:mm',
        },
        theme: 'dark',
      },
    };

    const series = [
      {
        name: title,
        data: chartData,
      },
    ];

    // Destroy previous chart if exists
    if (this.charts[elementId]) {
      this.charts[elementId].destroy();
    }

    // Create new chart
    try {
      const element = document.getElementById(elementId);
      console.log(`Chart element exists for ${elementId}:`, !!element);

      const chart = new ApexCharts(element, {
        ...options,
        series,
        colors: [color],
      });

      chart.render();
      console.log(`Chart rendered successfully: ${elementId}`);
      this.charts[elementId] = chart;
    } catch (error) {
      console.error(`Failed to render chart ${elementId}:`, error);
    }
  }

  renderSocChart(elementId, data) {
    if (!data || data.length === 0) {
      console.warn('No SOC data');
      return;
    }

    console.log(`Rendering SOC chart with ${data.length} points`);
    const chartData = data.map(item => [item.timestamp, item.value]);

    const options = {
      chart: {
        type: 'line',
        height: 300,
        background: 'transparent',
        foreColor: '#cfcfcf',
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 700,
        },
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      grid: {
        borderColor: 'rgba(255,255,255,0.08)',
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: '#8f8f8f',
          },
        },
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: {
          style: {
            colors: '#8f8f8f',
          },
        },
        title: {
          text: 'SOC (%)',
          style: {
            color: '#8f8f8f',
          },
        },
      },
      tooltip: {
        shared: true,
        x: {
          format: 'HH:mm',
        },
        theme: 'dark',
      },
    };

    const series = [
      {
        name: 'Battery SOC',
        data: chartData,
      },
    ];

    // Destroy previous chart if exists
    if (this.charts[elementId]) {
      this.charts[elementId].destroy();
    }

    // Create new chart
    try {
      const element = document.getElementById(elementId);
      console.log(`Chart element exists for ${elementId}:`, !!element);

      const chart = new ApexCharts(element, {
        ...options,
        series,
        colors: ['#d8d8d8'],
      });

      chart.render();
      console.log(`Chart rendered successfully: ${elementId}`);
      this.charts[elementId] = chart;
    } catch (error) {
      console.error(`Failed to render chart ${elementId}:`, error);
    }
  }
}
