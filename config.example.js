// Configuration template - COPY to config.js and fill in your details
// DO NOT commit config.js to git

const CONFIG = {
  // Home Assistant API URL (e.g., http://192.168.1.100:8123 or https://myha.example.com)
  HA_URL: 'http://your-home-assistant-url:8123',

  // Home Assistant long-lived access token
  // Create at http://your-ha-url/profile/security
  HA_TOKEN: 'your-long-lived-access-token-here',

  // Refresh interval in milliseconds (default: 30000 = 30 seconds)
  REFRESH_INTERVAL: 30000,

  // Entity IDs for your solar system
  // Customize these if your entity IDs differ
  ENTITIES: {
    // PV Input
    pv_atlas: 'sensor.growatt_0hvr70zr21bt00ah_pv_total_power',
    pv_helios: 'sensor.shelly_outdoor_power_positive',
    pv_combined: 'sensor.combined_solar_power',

    // Daily Yield
    daily_atlas: 'sensor.nexa_solar_energy_daily',
    daily_helios: 'sensor.shelly_outdoor_energy_daily',
    daily_solar_gen: 'sensor.solar_generation_today_total',

    // Battery
    battery_soc: 'sensor.growatt_0hvr70zr21bt00ah_total_battery_soc',
    battery_kwh: 'sensor.nexa_battery_soc_kwh',
    battery_temp: 'sensor.growatt_0hvr70zr21bt00ah_battery_1_temperature',

    // Battery Bank
    battery_total: 'sensor.growatt_0hvr70zr21bt00ah_total_battery_soc',
    battery_bat01: 'sensor.growatt_0hvr70zr21bt00ah_battery_1_soc',
    battery_bat02: 'sensor.growatt_0hvr70zr21bt00ah_battery_2_soc',
    battery_bat03: 'sensor.growatt_0hvr70zr21bt00ah_battery_3_soc',
    battery_bat04: 'sensor.growatt_0hvr70zr21bt00ah_battery_4_soc',

    // Power Flow
    battery_flow: 'sensor.growatt_0hvr70zr21bt00ah_discharging_power',
    atlas_output: 'sensor.growatt_0hvr70zr21bt00ah_output_power',
    grid_power: 'sensor.shellypro3em_3c8a1fd26b78_total_active_power',

    // EPEX Pricing
    epex_price: 'sensor.epex_spot_data_market_price',
    epex_avg: 'sensor.epex_spot_data_average_price_3',
    epex_threshold: 'sensor.epex_25_percent_average_price'
  }
};
