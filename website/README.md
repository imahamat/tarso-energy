# TARSO ENERGY — Website with Decap CMS

## Architecture

Static website with Decap CMS (formerly Netlify CMS) admin panel for content management.

- **Frontend**: Pure HTML/CSS/JS — no build step
- **CMS**: Decap CMS at `/admin` for visual content editing
- **Auth**: Netlify Identity (free tier — email login)
- **Content**: JSON files in `content/` folder, managed by CMS
- **Hosting**: Netlify free tier

## File Structure

```
website/
├── index.html                    # Homepage
├── systemes-solaires.html        # Solar systems catalog
├── stations-portables.html       # Portable stations & accessories
├── anti-insectes.html            # GLEECON insect killers
├── a-propos.html                 # About & Contact
├── admin/
│   ├── index.html                # Decap CMS admin panel
│   └── config.yml                # CMS collections configuration
├── assets/
│   ├── css/style.css             # Complete stylesheet
│   ├── js/main.js                # Dynamic content loader + interactions
│   └── images/                   # Logo, hero, uploads
├── content/
│   ├── settings.json             # Company info, contact, social links
│   ├── solar-systems/            # One JSON per solar system
│   ├── portable-stations/        # One JSON per portable station
│   ├── accessories/              # Panels, jump starters, power banks
│   ├── gleecon/                  # One JSON per insect killer
│   ├── faq/faq.json              # FAQ questions & answers
│   ├── testimonials/             # Customer testimonials
│   ├── promotions/               # Promotional banners
│   └── gallery/                  # Photo gallery entries
├── netlify.toml                  # Netlify configuration
├── _redirects                    # URL redirects
└── README.md                     # This file
```

## Deployment to Netlify

### Step 1: Push to GitHub

```bash
cd /home/imahamat/tarso-energy
git init
git add website/
git commit -m "Initial website with Decap CMS"
git remote add origin https://github.com/YOUR_USERNAME/tarso-energy.git
git push -u origin main
```

### Step 2: Deploy on Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repo
4. Set **Publish directory** to `website`
5. Deploy

### Step 3: Enable Netlify Identity (for admin login)

1. In Netlify dashboard → Site settings → Identity
2. Click "Enable Identity"
3. Under Registration → Set to "Invite only"
4. Under External providers → Optional: enable Google login
5. Under Services → Git Gateway → Click "Enable Git Gateway"
6. Go to Identity tab → Click "Invite users" → Enter your email
7. Check your email and set a password

### Step 4: Access Admin Panel

1. Go to `https://your-site.netlify.app/admin/`
2. Login with your email and password
3. You can now edit all content visually!

### Step 5: Custom Domain

1. In Netlify → Domain settings → Add custom domain
2. Enter `www.tarso.energy`
3. Update DNS at your domain registrar:
   - CNAME record: `www` → `your-site.netlify.app`
   - Or A record to Netlify's IP (shown in dashboard)

## Admin Panel — What You Can Edit

| Section | What you can change |
|---------|-------------------|
| **Paramètres** | Company name, tagline, hero text, about text, phone numbers, email, social links |
| **Systèmes Solaires** | Add/edit/delete solar systems, prices, specs, images |
| **Stations Portables** | Add/edit/delete portable stations, prices, features |
| **Accessoires** | Add/edit/delete panels, jump starters, power banks |
| **Anti-Insectes** | Add/edit/delete GLEECON products, prices, specs |
| **FAQ** | Add/edit/reorder FAQ questions and answers |
| **Témoignages** | Add customer testimonials with photos |
| **Promotions** | Create promotional banners with start/end dates |
| **Galerie** | Upload and organize product/event photos |

## Colors (from logo)

| Color | Hex | Usage |
|-------|-----|-------|
| Dark Navy | `#1B2A4A` | Primary — navbar, headers |
| Globe Blue | `#2B6CB0` | Secondary — links, trust |
| Orange | `#E8751A` | Accent — CTAs, prices, "ENERGY" |
| Sun Gold | `#F5A623` | Highlights, hover |
| Green | `#5BA532` | Eco badges, stock indicators |
| Deep Navy | `#0F1724` | Footer, dark sections |
| Off-White | `#F8F9FC` | Backgrounds |

## Contact

- **WhatsApp**: +235 62 39 08 88
- **Email**: contact@tarso.energy
- **Facebook**: facebook.com/tarso.energy
