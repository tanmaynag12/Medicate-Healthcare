from flask import Flask, redirect, request, render_template, url_for, flash, jsonify, session 
from flask_pymongo import PyMongo
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Your secret key is crucial for session security. 
# Make sure this is a long, random key.
app.secret_key = os.environ.get('SECRET_KEY', 'your_very_secret_key') 

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

app.config["MONGO_URI"] = "mongodb://localhost:27017/medicate_db"
mongo = PyMongo(app)

# In-memory dummy data for pharmacies
pharmacies_data = [
    {"name": "Medicare Pharmacy", "address": "MG Road, Bangalore", "contact": "9876543210", "pincode": "560001"},
    {"name": "Apollo Pharmacy", "address": "Koramangala, Bangalore", "contact": "9988776655", "pincode": "560034"},
    {"name": "Wellness Pharmacy", "address": "Indiranagar, Bangalore", "contact": "9123456780", "pincode": "560038"}
]

# --- Routes ---
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        existing_user = mongo.db.users.find_one({"email": email})
        if existing_user:
            flash("Email already registered!", "error")
        else:
            mongo.db.users.insert_one({
                "username": username,
                "email": email,
                "password": password
            })

            session['user'] = username
            flash("Signup successful! You are now logged in.", "success")
            return redirect(url_for('home'))

    return render_template('signup.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = mongo.db.users.find_one({"email": email, "password": password})
        if user:
            session['user'] = user['username']
            flash(f"Welcome back, {user['username']}!", "success")
            return redirect(url_for('home'))
        else:
            flash("Invalid login details!", "error")
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    flash("You have been logged out.", 'info')
    return redirect(url_for('home'))

@app.route('/pharmacy-locator', methods=['GET', 'POST'])
def pharmacy_locator():
    pharmacies = []
    if request.method == 'POST':
        query = request.form.get('pincode')
        if query:
            pharmacies = [p for p in pharmacies_data if p['pincode'] == query]
        
        if not pharmacies and query:
            flash(f"No pharmacies found for pincode {query}.", 'error')
    
    return render_template("pharmacy_locator.html", pharmacies=pharmacies)

@app.route('/book_appointment', methods=['GET', 'POST'])
def book_appointment():
    if request.method == 'POST':
        appointment = {
            "name": request.form.get('name'),
            "email": request.form.get('email'),
            "phone": request.form.get('phone'),
            "doctor": request.form.get('doctor'),
            "date": request.form.get('date')
        }
        mongo.db.appointments.insert_one(appointment)
        flash(f"Appointment booked successfully for {appointment['name']} with {appointment['doctor']} on {appointment['date']}.", 'success')
        return redirect(url_for('book_appointment'))
    return render_template("book_appointment.html")

@app.route("/chatbot")
def chatbot():
    if 'user' in session:  
        username = session['user']
        return render_template("chatbot.html")
    else:
        flash("You must be logged in to access the chatbot.", "error")
        return redirect(url_for("login"))


@app.route("/chat", methods=["POST"])
def chat():
    if 'user' not in session:
        return jsonify({"reply": "You must be logged in to chat."}), 403

    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"reply": "Please type something!"})
    
    if 'chat_history' not in session:
        session['chat_history'] = []

    chat_session = model.start_chat(history=session['chat_history'])

    try:
        response = chat_session.send_message(user_message)
        session['chat_history'].append({'role': 'user', 'parts': [{'text': user_message}]})
        session['chat_history'].append({'role': 'model', 'parts': [{'text': response.text}]})
        return jsonify({"reply": response.text})
    except Exception as e:
        print(f"Error generating content: {e}")
        return jsonify({"reply": "Sorry, I couldn’t process that at the moment."}), 500


@app.route('/clear_history', methods=['POST'])
def clear_history():
    # Remove the chat history from the session
    session.pop('chat_history', None)
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True)
