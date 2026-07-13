# 🦷 S.N Dental Clinic — Dr. Srihari

> Professional dental clinic portfolio website for **Dr. Srihari**, MDS Periodontist with 25+ years of experience at **S.N Dental Clinic**, R.S. Puram, Coimbatore.

🌐 **Live:** [dental-clinic-portfolio-web.vercel.app](https://dental-clinic-portfolio-web.vercel.app)

---

## 📁 Project Structure

```
├── index.html              # Homepage
├── server.js               # Express.js backend API (port 3001)
├── package.json
├── sitemap.xml
├── robots.txt
├── firebase.json           # Firebase hosting config
│
├── pages/
│   ├── about.html          # Doctor profile & qualifications
│   ├── services.html       # 12 dental treatments
│   ├── gallery.html        # Filterable image gallery
│   ├── testimonials.html   # Patient reviews
│   ├── blog.html           # Dental health articles
│   ├── appointment.html    # 3-step booking wizard
│   └── contact.html        # Contact form & map
│
├── css/
│   ├── main.css            # Design tokens & typography
│   ├── components.css      # Navbar, cards, forms, footer
│   └── animations.css      # Scroll reveals, WhatsApp widget
│
├── js/
│   ├── main.js             # Global logic & WhatsApp bot
│   ├── api.js              # Frontend API client
│   └── firebase-config.js  # Firebase + localStorage dual mode
│
└── images/
    ├── hero_bg.png
    ├── doctor_portrait.png
    ├── clinic_interior.png
    └── dental_services.png
```

---

## ✨ Features

- **Premium UI** — Glassmorphism, smooth animations, mobile-first responsive design
- **WhatsApp Bot** — Floating chat widget with appointment booking conversation flow
- **Appointment System** — 3-step booking wizard with time slot selection
- **Express Backend** — REST API for appointments & contact messages stored in `data/db.json`
- **Firebase Ready** — Toggle `FIREBASE_ENABLED = true` in `js/firebase-config.js` to switch from localStorage to Firestore
- **SEO Optimised** — Schema.org markup, Open Graph, sitemap, robots.txt

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start the server (serves frontend + backend on port 3001)
npm start
```

Then open **http://localhost:3001**

---

## 🔑 Clinic Details

| | |
|--|--|
| **Doctor** | Dr. Srihari |
| **Specialisation** | Periodontist & Implantologist |
| **Qualification** | MDS — Rajah Muthiah Dental College (2001) |
| **Experience** | 25+ Years |
| **Phone** | +91 98430 22094 |
| **Clinic** | S.N Dental Clinic, #30 D.B. Road, R.S. Puram, Coimbatore |
| **Rating** | 100/100 on Practo ⭐ |

---

## 🌐 Deployment

**Vercel** — Import this repo at [vercel.com](https://vercel.com), set output directory to `.`

**Firebase Hosting:**
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```
