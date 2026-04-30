# Deployment Guide for nrg.pxlfrg.com

## Deployment Methods

### Method 1: Git Pull (Recommended)

If you have SSH access to your webserver:

```bash
# SSH into your webserver
ssh user@pxlfrg.com

# Navigate to your web directory
cd /var/www/pxlfrg.com/public_html/nrg

# Clone the repository (first time only)
git clone https://github.com/xKoNsTix/nrg-solar.git .

# Copy config template
cp config.example.js config.js

# Edit config with your Home Assistant details
nano config.js

# Future updates
git pull origin main
```

### Method 2: SFTP Upload

If you prefer manual upload:

```bash
# From your local machine
sftp user@pxlfrg.com

# Navigate to destination
cd /var/www/pxlfrg.com/public_html/nrg

# Upload all files
put -r /tmp/nrg-solar/* .

# Remember to add config.js manually (don't upload from local repo)
```

### Method 3: GitHub Actions (CI/CD)

For automatic deployment on push, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to nrg.pxlfrg.com

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy via SFTP
        uses: wlixcc/SFTP-Deploy-Action@v1.2.4
        with:
          username: ${{ secrets.SFTP_USERNAME }}
          password: ${{ secrets.SFTP_PASSWORD }}
          server: pxlfrg.com
          local_path: './*'
          remote_path: '/var/www/pxlfrg.com/public_html/nrg/'
```

Then add these secrets to your GitHub repo:
- `SFTP_USERNAME`: Your webserver username
- `SFTP_PASSWORD`: Your webserver password

## Configuration on Webserver

After deploying files:

1. **Copy config template:**
   ```bash
   cp config.example.js config.js
   ```

2. **Edit with your Home Assistant details:**
   ```bash
   nano config.js
   ```
   Fill in:
   - `HA_URL`: Your Home Assistant external URL
   - `HA_TOKEN`: Long-lived access token from HA

3. **Verify permissions:**
   ```bash
   chmod 644 *.html *.js *.css
   chmod 755 .
   ```

4. **Test access:**
   - Visit https://nrg.pxlfrg.com in your browser
   - Check browser console (F12) for any errors
   - Verify connection status shows "Connected"

## Post-Deployment Setup

### 1. Enable CORS in Home Assistant

Edit `configuration.yaml`:

```yaml
http:
  cors_allowed_origins:
    - https://nrg.pxlfrg.com
    - https://www.nrg.pxlfrg.com
```

Restart Home Assistant for changes to take effect.

### 2. Create Home Assistant Token

1. Go to Home Assistant: http://your-ha-url/profile/security
2. Scroll down to "Long-Lived Access Tokens"
3. Click "Create Token"
4. Copy the entire token
5. Paste into your `config.js` HA_TOKEN field

### 3. Update Entity IDs (if needed)

If your Home Assistant entity names differ from defaults:

1. Go to Home Assistant Settings > Devices & Services > Entities
2. Find your solar system entities
3. Copy the entity IDs
4. Update them in `config.js` ENTITIES object

## Testing

### Connection Test

1. Open browser console (F12)
2. Check for any CORS errors
3. Verify API requests succeed in Network tab
4. Check that data displays and updates every 30s

### Data Validation

Verify all sensors show correct values:
- Compare with Home Assistant UI
- Check energy values match daily totals
- Verify SOC percentages

## Troubleshooting

### "Disconnected" Status

**Possible causes:**
1. Wrong HA_URL - verify it's accessible from your public IP
2. Invalid token - create a new one in Home Assistant
3. CORS not enabled - check configuration.yaml
4. Firewall blocking requests - check port 8123 is accessible

**Debug:**
```javascript
// Open browser console and run:
new HomeAssistantAPI(CONFIG).testConnection().then(r => console.log('Connected:', r))
```

### Data Shows "--"

1. Entity IDs might be wrong - check in Home Assistant
2. Sensors might not be available - verify in HA Settings > Entities
3. API token missing read permissions - recreate token

### 404 on https://nrg.pxlfrg.com

1. Check files are in correct directory
2. Verify webserver is configured for that subdomain
3. Check DNS points to webserver
4. Verify webserver document root

## Updates

To get latest dashboard updates:

```bash
cd /var/www/pxlfrg.com/public_html/nrg
git pull origin main
# Remember: your config.js will not be updated (in .gitignore)
```

## Security Checklist

- [ ] config.js is NOT in git repository
- [ ] HTTPS enabled on nrg.pxlfrg.com
- [ ] Home Assistant token is kept private
- [ ] Only read permissions needed on HA token
- [ ] CORS restricted to nrg.pxlfrg.com
- [ ] No control functions exposed in UI

## Support

For issues:
1. Check browser console for error messages
2. Check Home Assistant logs
3. Test API connection manually
4. Review CORS configuration
