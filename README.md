# NRG Aurora - Solar Power Monitoring Dashboard

A real-time solar power monitoring dashboard for Home Assistant solar installations. Features live PV input monitoring, battery status, energy trading prices, and power flow visualization.

## Features

- **Real-time Monitoring**
  - PV input from ATLAS, HELIOS, and combined solar systems
  - Battery state of charge and temperature
  - Power flow (charging/discharging/idle)
  - Grid power consumption

- **Daily Analytics**
  - Daily energy yield per system
  - Total solar generation
  - Battery charge/discharge cycles

- **Energy Trading**
  - EPEX spot price tracking
  - Moving average pricing
  - Buy threshold alerts

- **Read-Only View**
  - Safe public-facing dashboard
  - No control functions exposed
  - 30-second auto-refresh

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/nrg-solar.git
cd nrg-solar
```

### 2. Configure Home Assistant Connection

1. Copy the example config:
   ```bash
   cp config.example.js config.js
   ```

2. Edit `config.js` with your Home Assistant details:
   ```javascript
   const CONFIG = {
     HA_URL: 'http://192.168.1.100:8123',  // Your HA URL
     HA_TOKEN: 'your-token-here',           // Long-lived access token
     REFRESH_INTERVAL: 30000,                // Update every 30 seconds
     // ... entity IDs
   };
   ```

3. **To get your token:**
   - Go to Home Assistant UI
   - Click your profile icon (bottom left)
   - Scroll to "Long-Lived Access Tokens"
   - Create new token
   - Copy the entire token value into config.js

4. **Customize entity IDs** in config.js if your sensors have different names

### 3. Deploy to Web Server

#### Option A: Static File Hosting (nrg.pxlfrg.com)

1. Build/prepare files (already minified and ready)
2. Upload via SFTP or git:
   ```bash
   # Via SFTP
   sftp user@pxlfrg.com
   put -r . /public_html/nrg/
   
   # Or push via GitHub and deploy
   git push
   ```

#### Option B: Local Development

```bash
# Python 3
python -m http.server 8000

# Or Node.js
npx http-server

# Visit http://localhost:8000
```

## Security Notes

⚠️ **IMPORTANT**: 
- `config.js` is in `.gitignore` - never commit it to git
- Your Home Assistant token in `config.js` should NOT be pushed to any public repository
- This dashboard is READ-ONLY - no control functions are exposed
- CORS must be enabled on your Home Assistant instance for cross-domain requests

### Enabling CORS in Home Assistant

Add to your `configuration.yaml`:

```yaml
http:
  cors_allowed_origins:
    - http://localhost:8000
    - https://nrg.pxlfrg.com
```

Then restart Home Assistant.

## Project Structure

```
nrg-solar/
├── index.html       # Main dashboard HTML
├── styles.css       # Styling
├── api.js          # Home Assistant API client
├── app.js          # Dashboard logic
├── config.example.js # Configuration template
├── config.js       # Your local config (NOT in git)
├── .gitignore      # Git ignore rules
└── README.md       # This file
```

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (responsive design)

## Troubleshooting

### Connection Issues

1. Check HA_URL is correct and accessible from browser
2. Verify token is not expired (create a new one if needed)
3. Check CORS is enabled in Home Assistant config
4. Check browser console for specific error messages

### Data Not Updating

1. Verify entity IDs in config.js match your Home Assistant
2. Check that sensors are publishing data (view in HA UI)
3. Check browser console for API errors
4. Verify network tab shows successful API calls

## Development

To modify the dashboard:

1. Edit `index.html` for layout
2. Edit `styles.css` for appearance
3. Edit `app.js` for functionality
4. Test locally with `python -m http.server 8000`

## License

MIT

## Credits

Dashboard design inspired by Home Assistant Starfield custom animation theme.
