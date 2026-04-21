# Admin Security & Device Protection

HackStorm AI implements a dual-layer security model to protect the `/admin` portal. This guide explains how to configure and use these security features.

---

## 🛡️ 1. IP-Based Whitelisting

By default, the admin panel can be restricted to specific IP addresses. This is enforced at both the **Frontend (Next.js Middleware)** and **Backend (FastAPI Middleware)** levels.

### Configuration
Set the following environment variable in your Vercel (Frontend) and Render (Backend) dashboards:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `ALLOWED_ADMIN_IPS` | Comma-separated list of IPv4/IPv6 addresses. | `1.2.3.4, 2001:db8::1` |

### Behavior
- If `ALLOWED_ADMIN_IPS` is **not set**, IP restriction is disabled (useful for local development).
- If your IP is not in the list, you will be redirected to the `/forbidden` page, which will display your **Detected IP** for easy troubleshooting.

---

## 💻 2. Device Authorization (Laptop Link)

Since mobile and home IP addresses often change (Dynamic IP), we provide a **Device Authorization** system. This allows you to authorize a specific laptop/device using a secret key, bypassing IP restrictions for that device.

### Configuration
Set this environment variable to a strong, private password:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `ADMIN_DEVICE_SECRET` | A secret key used to authorize your laptop. | `my_super_secret_key_2024` |

### How to Authorize a Device
1. Navigate to: `https://your-domain.com/admin/authorize`
2. Enter your `ADMIN_DEVICE_SECRET`.
3. Click **"Authorize This Laptop"**.
4. A secure, long-lived cookie (`hackstorm_admin_auth`) will be stored in your browser.

### Benefits
- **Bypass IP Filters**: Once authorized, you can access the admin panel even if your IP changes (e.g., on a mobile SIM).
- **365-Day Validity**: The authorization lasts for one year unless you clear your browser cookies.
- **Hardware Bound**: Only the specific browser on that laptop will be granted access.

---

## 🚦 3. Custom Error Pages

We have implemented premium, branded error pages to handle security events:

- **403 Forbidden**: Shown when access is denied. Displays the user's detected IP and connection logs.
- **404 Not Found**: A "HackStorm Terminal" themed page for missing resources.
- **400 Bad Request**: Includes a debugging checklist for malformed requests.
- **Generic Error (500)**: Displays diagnostic info and Node/Network IP for troubleshooting.

---

## 🛠️ Troubleshooting

### "I am seeing Access Denied on my authorized laptop"
1. **Check Cookies**: Ensure `hackstorm_admin_auth` cookie is present in your browser settings.
2. **Re-authorize**: Go back to `/admin/authorize` and re-enter your secret key.
3. **Env Vars**: Ensure `ADMIN_DEVICE_SECRET` is set correctly on **both** Vercel and Render.

### "How do I find my IP to whitelist it?"
Go to the `/forbidden` page on your site. It will explicitly show your **"Detected IP"** at the bottom of the screen.
