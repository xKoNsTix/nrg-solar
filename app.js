class SolarDashboard {
  constructor() {
    this.api = new HomeAssistantAPI(CONFIG);
    this.refreshInterval = CONFIG.REFRESH_INTERVAL;
    this.isConnected = false;
    this.lastUpdateTime = null;
    this.init();
  }

  async init() {
    // Test connection first
    const connected = await this.api.testConnection();
    this.setConnectionStatus(connected);

    if (connected) {
      // Initial data load
      await this.updateData();

      // Set up periodic updates
      setInterval(() => this.updateData(), this.refreshInterval);
    } else {
      this.showError('Unable to connect to Home Assistant. Check URL and token in config.js');
    }
  }

  async updateData() {
    try {
      const data = await this.api.getAllData();

      if (!data) {
        throw new Error('No data received from Home Assistant');
      }

      this.updateUI(data);
      this.lastUpdateTime = new Date();
      this.updateLastUpdate();
      this.setConnectionStatus(true);
    } catch (error) {
      console.error('Error updating data:', error);
      this.setConnectionStatus(false);
      this.showError(`Update failed: ${error.message}`);
    }
  }

  updateUI(data) {
    // PV Input
    this.updateValue('atlas-pv', data.pv_atlas, 'W', 0);
    this.updateValue('helios-pv', data.pv_helios, 'W', 0);
    this.updateValue('combined-pv', data.pv_combined, 'W', 0);

    this.updateBar('atlas-bar', data.pv_atlas, 1500);
    this.updateBar('helios-bar', data.pv_helios, 800);
    this.updateBar('combined-bar', data.pv_combined, 2500);

    // Daily Yield
    this.updateValue('atlas-daily', data.daily_atlas, 'kWh', 3);
    this.updateValue('helios-daily', data.daily_helios, 'kWh', 3);
    this.updateValue('solar-gen', data.daily_solar_gen, 'kWh', 2);

    // Battery
    const socValue = this.api.getValue(data.battery_soc, 0);
    this.updateValue('atlas-soc', data.battery_soc, '%', 0);
    this.updateBar('soc-bar', data.battery_soc, 100);
    this.updateElement('soc-status', this.getSocStatus(socValue));

    const kwhValue = this.api.getValue(data.battery_kwh, 0);
    this.updateValue('battery-kwh', data.battery_kwh, 'kWh', 2);
    const kwhPercent = Math.round((kwhValue / 8) * 100);
    this.updateElement('battery-pct', `${kwhPercent}% charged`);
    this.updateBar('battery-bar', { state: kwhPercent }, 100);

    this.updateValue('battery-temp', data.battery_temp, '°C', 1);

    // Battery Bank
    this.updateElement('total-battery', this.formatValue(data.battery_total, 0));
    this.updateElement('bat01', this.formatValue(data.battery_bat01, 0));
    this.updateElement('bat02', this.formatValue(data.battery_bat02, 0));
    this.updateElement('bat03', this.formatValue(data.battery_bat03, 0));
    this.updateElement('bat04', this.formatValue(data.battery_bat04, 0));

    // Power Flow
    const flowValue = this.api.getValue(data.battery_flow, 0);
    this.updateValue('battery-flow', data.battery_flow, 'W', 0);
    this.updateElement('battery-flow-state', this.getFlowStatus(flowValue));

    this.updateValue('atlas-output', data.atlas_output, 'W', 0);
    this.updateValue('grid-power', data.grid_power, 'W', 0);

    // EPEX Pricing
    this.updateValue('epex-price', data.epex_price, '€/kWh', 4);
    this.updateValue('epex-avg', data.epex_avg, '€/kWh', 4);
    this.updateValue('epex-threshold', data.epex_threshold, '€/kWh', 4);
  }

  updateValue(elementId, entity, unit, decimals = 2) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const value = this.api.getValue(entity, null);
    if (value === null) {
      element.textContent = '--';
    } else {
      element.textContent = value.toFixed(decimals);
    }
  }

  updateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = content;
    }
  }

  updateBar(elementId, entity, max = 100) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const value = this.api.getValue(entity, 0);
    const percentage = Math.min((value / max) * 100, 100);
    element.style.setProperty('--percentage', `${percentage}%`);
  }

  formatValue(entity, decimals = 2) {
    const value = this.api.getValue(entity, null);
    if (value === null) return '--';
    return value.toFixed(decimals);
  }

  getSocStatus(percentage) {
    if (percentage > 80) return 'HIGH RESERVE';
    if (percentage > 35) return 'NOMINAL';
    return 'LOW';
  }

  getFlowStatus(power) {
    if (power > 30) return 'CHARGING';
    if (power < -30) return 'DISCHARGING';
    return 'IDLE';
  }

  setConnectionStatus(connected) {
    this.isConnected = connected;
    const statusDot = document.getElementById('connection-status');
    const statusText = document.getElementById('status-text');

    if (statusDot && statusText) {
      if (connected) {
        statusDot.classList.remove('disconnected');
        statusDot.classList.add('connected');
        statusText.textContent = 'Connected';
        statusText.style.color = '#4ade80';
      } else {
        statusDot.classList.remove('connected');
        statusDot.classList.add('disconnected');
        statusText.textContent = 'Disconnected';
        statusText.style.color = '#ef4444';
      }
    }
  }

  updateLastUpdate() {
    const element = document.getElementById('last-update');
    if (element && this.lastUpdateTime) {
      const timeStr = this.lastUpdateTime.toLocaleTimeString();
      element.textContent = timeStr;
    }
  }

  showError(message) {
    console.error(message);
    // You could add a toast notification here
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SolarDashboard();
  });
} else {
  new SolarDashboard();
}
