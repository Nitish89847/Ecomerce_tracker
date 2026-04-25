# ⚡ PricePulse – Amazon Price Tracker

A full-stack price tracking web application built with Django and React. Track product prices, monitor history, and receive alerts when prices drop.

---

## 🚀 Features

* 🔍 Search products using real-time Amazon data
* 📦 Track products and monitor price changes
* 📈 View price history with charts
* 🔔 Set price drop alerts
* 🔄 Refresh product prices manually
* 🌙 Modern dark-themed responsive UI

---

## 🏗️ Tech Stack

**Backend**

* Django
* Django REST Framework
* SQLite

**Frontend**

* React (Vite)
* Axios
* Recharts
* Lucide Icons

**API**

* RapidAPI – Real-Time Amazon Data

---

## 📁 Project Structure

```
price-tracker/
├── backend/
│   ├── api/                # Django app (models, views, services)
│   ├── tracker/            # Django project (settings, urls)
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                # API keys (not committed)
│
└── frontend/
    ├── src/
    │   ├── App.jsx         # Main UI
    │   ├── api.js          # API client
    │   └── index.css       # Styles
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```
git clone https://github.com/your-username/price-tracker.git
cd price-tracker
```

---

## 🐍 Backend Setup (Django)

```
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

## ⚛️ Frontend Setup (React)

```
cd frontend
cd frontend

npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file inside `backend/`:

```
RAPIDAPI_KEY=your_api_key_here
```

---

## 🔌 API Endpoints

| Method | Endpoint                     | Description      |
| ------ | ---------------------------- | ---------------- |
| GET    | /api/search/?q=laptop        | Search products  |
| GET    | /api/product/{asin}/         | Product details  |
| GET    | /api/product/{asin}/history/ | Price history    |
| POST   | /api/track/                  | Track product    |
| DELETE | /api/untrack/{asin}/         | Untrack product  |
| POST   | /api/product/{asin}/refresh/ | Refresh price    |
| GET    | /api/product/{asin}/alerts/  | Get alerts       |
| POST   | /api/product/{asin}/alerts/  | Create alert     |
| DELETE | /api/alerts/{id}/delete/     | Delete alert     |
| GET    | /api/alerts/                 | All alerts       |
| GET    | /api/tracked/                | Tracked products |

---

## 📸 Screenshots (optional)

Add screenshots here for better presentation.

---

## ⚠️ Notes

* This project uses a third-party API for Amazon data
* API keys should never be committed to GitHub
* Some APIs may have rate limits

---

## 🚀 Future Improvements

* Email notifications for alerts
* Background price tracking (Celery + Redis)
* User authentication system
* Deployment (Docker + Cloud)

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Acknowledgements

* Amazon product data via RapidAPI
* Open-source community tools and libraries
