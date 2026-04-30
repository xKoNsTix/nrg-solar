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
      // Calculate start and end times based on period
      const now = new Date();
      const start = new Date(now);

      // Parse period string (e.g., "24h", "7d")
      const match = period.match(/^(\d+)([hd])$/);
      if (match) {
        const amount = parseInt(match[1]);
        const unit = match[2];
        if (unit === 'h') {
          start.setHours(start.getHours() - amount);
        } else if (unit === 'd') {
          start.setDate(start.getDate() - amount);
        }
      }

      const startTime = start.toISOString();
      const endTime = now.toISOString();

      const url = `${this.api.url}/api/history?filter_entity_ids=${entityId}&start_time=${startTime}&end_time=${endTime}`;
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
      console.log(`✓ Fetched history for ${entityId}`);

      // Home Assistant returns data in format: { data: { entities: [{ entity_id, states }] } }
      let historyArray = null;

      if (data && data.data && data.data.entities && Array.isArray(data.data.entities)) {
        const entity = data.data.entities[0];
        if (entity && entity.states && Array.isArray(entity.states)) {
          historyArray = entity.states;
          console.log(`✓ Found ${historyArray.length} state changes for ${entityId}`);
        }
      }

      if (historyArray && historyArray.length > 0) {
        const mapped = historyArray.map(item => ({
          timestamp: new Date(item.last_changed).getTime(),
          value: parseFloat(item.state) || 0,
        }));
        console.log(`✓ Mapped ${mapped.length} data points for ${entityId}`);
        return mapped;
      } else {
        console.error(`✗ Failed to extract history array for ${entityId}`, { data });
        return [];
      }
    } catch (error) {
      console.error(`Error fetching history for ${entityId}:`, error);
      return [];
    }
  }

  renderProductionChart(elementId, data, title, color) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element not found: ${elementId}`);
      return;
    }

    if (!data || data.length === 0) {
      console.warn(`No data for ${title}`);
      element.innerHTML = '<div style="color: #8f8f8f; padding: 20px; text-align: center;">No data available</div>';
      return;
    }

    console.log(`Rendering ${title} chart with ${data.length} points`);

    try {
      // Simple SVG-based chart instead of ApexCharts
      const minValue = Math.min(...data.map(d => d.value));
      const maxValue = Math.max(...data.map(d => d.value));
      const range = maxValue - minValue || 1;

      const width = element.clientWidth || 600;
      const height = 300;
      const padding = 40;
      const chartWidth = width - 2 * padding;
      const chartHeight = height - 2 * padding;

      let svg = `<svg width="${width}" height="${height}" style="background: transparent;">`;

      // Draw grid
      svg += `<line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
      svg += `<line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;

      // Draw data points and line
      let pathD = '';
      data.forEach((point, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = height - padding - ((point.value - minValue) / range) * chartHeight;

        if (i === 0) {
          pathD += `M${x},${y}`;
        } else {
          pathD += `L${x},${y}`;
        }
      });

      svg += `<path d="${pathD}" stroke="${color}" stroke-width="2" fill="none"/>`;

      // Draw data points
      data.forEach((point, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = height - padding - ((point.value - minValue) / range) * chartHeight;
        svg += `<circle cx="${x}" cy="${y}" r="2" fill="${color}"/>`;
      });

      // Add labels
      svg += `<text x="${width/2}" y="${height - 5}" text-anchor="middle" fill="#8f8f8f" font-size="12">${title}</text>`;
      svg += `<text x="10" y="${padding + 20}" fill="#8f8f8f" font-size="10">${maxValue.toFixed(0)}W</text>`;
      svg += `<text x="10" y="${height - padding - 10}" fill="#8f8f8f" font-size="10">${minValue.toFixed(0)}W</text>`;

      svg += '</svg>';

      element.innerHTML = svg;
      console.log(`Chart rendered successfully: ${elementId}`);
    } catch (error) {
      console.error(`Failed to render chart ${elementId}:`, error);
      element.innerHTML = `<div style="color: #ef4444; padding: 20px;">Error rendering chart: ${error.message}</div>`;
    }
  }

  renderSocChart(elementId, data) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element not found: ${elementId}`);
      return;
    }

    if (!data || data.length === 0) {
      console.warn('No SOC data');
      element.innerHTML = '<div style="color: #8f8f8f; padding: 20px; text-align: center;">No data available</div>';
      return;
    }

    console.log(`Rendering SOC chart with ${data.length} points`);

    try {
      // Simple SVG-based chart
      const minValue = 0;
      const maxValue = 100;
      const range = 100;

      const width = element.clientWidth || 600;
      const height = 300;
      const padding = 40;
      const chartWidth = width - 2 * padding;
      const chartHeight = height - 2 * padding;

      let svg = `<svg width="${width}" height="${height}" style="background: transparent;">`;

      // Draw grid
      svg += `<line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
      svg += `<line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;

      // Draw data points and line
      let pathD = '';
      data.forEach((point, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = height - padding - ((point.value - minValue) / range) * chartHeight;

        if (i === 0) {
          pathD += `M${x},${y}`;
        } else {
          pathD += `L${x},${y}`;
        }
      });

      svg += `<path d="${pathD}" stroke="#d8d8d8" stroke-width="2" fill="none"/>`;

      // Draw data points
      data.forEach((point, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = height - padding - ((point.value - minValue) / range) * chartHeight;
        svg += `<circle cx="${x}" cy="${y}" r="2" fill="#d8d8d8"/>`;
      });

      // Add labels
      svg += `<text x="${width/2}" y="${height - 5}" text-anchor="middle" fill="#8f8f8f" font-size="12">Battery SOC</text>`;
      svg += `<text x="10" y="${padding + 20}" fill="#8f8f8f" font-size="10">100%</text>`;
      svg += `<text x="10" y="${height - padding - 10}" fill="#8f8f8f" font-size="10">0%</text>`;

      svg += '</svg>';

      element.innerHTML = svg;
      console.log(`Chart rendered successfully: ${elementId}`);
    } catch (error) {
      console.error(`Failed to render chart ${elementId}:`, error);
      element.innerHTML = `<div style="color: #ef4444; padding: 20px;">Error rendering chart: ${error.message}</div>`;
    }
  }
}
