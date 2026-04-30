class HomeAssistantAPI {
  constructor(config) {
    this.url = config.HA_URL;
    this.token = config.HA_TOKEN;
    this.entities = config.ENTITIES;
  }

  /**
   * Fetch state of a single entity
   */
  async getEntity(entityId) {
    try {
      const response = await fetch(
        `${this.url}/api/states/${entityId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${entityId}:`, error);
      return null;
    }
  }

  /**
   * Fetch multiple entities in parallel
   */
  async getEntities(entityIds) {
    const promises = entityIds.map(id => this.getEntity(id));
    const results = await Promise.all(promises);
    return results;
  }

  /**
   * Get all data needed for the dashboard
   */
  async getAllData() {
    const allEntities = Object.values(this.entities);
    const results = await this.getEntities(allEntities);

    // Map results back to entity names
    const data = {};
    Object.keys(this.entities).forEach((key, index) => {
      data[key] = results[index];
    });

    return data;
  }

  /**
   * Extract numeric value from entity state
   */
  getValue(entity, defaultValue = 0) {
    if (!entity || !entity.state) return defaultValue;
    const value = parseFloat(entity.state);
    return isNaN(value) ? defaultValue : value;
  }

  /**
   * Check if connection is working
   */
  async testConnection() {
    try {
      const response = await fetch(
        `${this.url}/api/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        }
      );
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}
