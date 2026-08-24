# Medicate – AI-Powered Healthcare Platform

## Overview

Medicate is a Flask-based web application that combines healthcare information, appointment booking, pharmacy lookup, and an AI-powered chatbot in a single Python project.

## Purpose

This project is designed to demonstrate a healthcare aggregator with the following goals:

- Provide a simple, centralized user experience for healthcare-related activities
- Show basic user authentication and session handling
- Offer appointment scheduling functionality
- Allow users to locate nearby pharmacies by pincode
- Provide AI-assisted chat support using Google Gemini
- Save user interactions and form submissions to MongoDB

## Architecture

- `app.py` — main Flask application and all route logic
- `templates/` — HTML pages rendered by Flask
- `static/` — CSS and JavaScript assets used by pages
- `requirements.txt` — Python package dependencies
- `.env` — environment settings for secret keys and external service credentials

## Key Components

### Backend

- Flask web server for routing and rendering templates
- Flask-PyMongo for MongoDB access
- Google Generative AI (`google.generativeai`) for the chatbot
- `python-dotenv` to load environment variables from `.env`

### Frontend

- HTML templates inside `templates/`
- CSS styles in `static/`
- JavaScript for chatbot interaction and UI behavior

## Main Routes and Features

The app exposes the following main pages and endpoints:

1. `/` — Home page (`home.html`)
2. `/signup` — Signup form and account creation (`signup.html`)
3. `/login` — Login form (`login.html`)
4. `/logout` — Log out the current user
5. `/pharmacy-locator` — Pharmacy lookup by pincode (`pharmacy_locator.html`)
6. `/book_appointment` — Appointment booking form (`book_appointment.html`)
7. `/chatbot` — Chat page requiring login (`chatbot.html`)
8. `/chat` — AJAX endpoint that sends a message to Gemini and returns a chat reply
9. `/clear_history` — AJAX endpoint to delete stored chat history
10. `/get_history` — AJAX endpoint to retrieve stored chat history
11. `/contact` — Contact form page (`contact.html`)
12. `/health_monitor` — Health monitoring form and simple guidance (`health_monitor.html`)
13. `/telemedicine` — Telemedicine information page (`telemedicine.html`)
14. `/about` — About page (`about.html`)
15. `/careers` — Careers page (`careers.html`)
16. `/news` — News page (`news.html`)
17. `/privacy` — Privacy policy page (`privacy.html`)
18. `/terms` — Terms and conditions page (`terms.html`)

## How the app works

### Authentication

- `POST /signup` saves a new user to MongoDB in the `users` collection.
- `POST /login` checks the email/password pair against `users` and stores `session['user']` on success.
- `GET /logout` clears the session and returns the user to the home page.

### Appointment booking

- `POST /book_appointment` stores appointment details in the `appointments` collection.
- The form includes patient name, email, phone, doctor, and appointment date.

### Pharmacy locator

- The app uses a static `pharmacies_data` list inside `app.py`.
- Users enter a pincode and the page filters pharmacies by that pincode.
- No external pharmacy API is called.

### AI Chatbot

- Only authenticated users can access `/chatbot`.
- The user’s email is found from the `users` collection, and chat history is loaded from `chat_history`.
- The `/chat` endpoint sends the user's message to Google Gemini using `model.start_chat()` and stores both the user prompt and model reply in MongoDB.
- Chat history is persisted per `user_email`.

### Contact form

- `POST /contact` stores name, email, and message in the `contacts` collection.

### Health monitoring

- `POST /health_monitor` stores heart rate, blood pressure, and glucose in the `health` collection.
- The app returns simple guidance based on the provided vital signs.

## Data model

### MongoDB collections used

- `users`
  - `username`
  - `email`
  - `password`
- `appointments`
  - `name`
  - `email`
  - `phone`
  - `doctor`
  - `date`
- `chat_history`
  - `user_email`
  - `username`
  - `history`
- `contacts`
  - `name`
  - `email`
  - `message`
- `health`
  - `user`
  - `heart_rate`
  - `blood_pressure`
  - `glucose`

## Setup Instructions

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate it:
   - Windows PowerShell:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - Windows CMD:
     ```cmd
     .\venv\Scripts\activate.bat
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file with the following values:
   ```env
   SECRET_KEY=your_secret_key_here
   MONGO_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
5. Run the app:
   ```bash
   python app.py
   ```
6. Open `http://localhost:5000`.


