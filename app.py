from flask import Flask, redirect, request, render_template, url_for, flash
from flask_pymongo import PyMongo
from flask import session  




app = Flask(__name__)
app.secret_key = 'your_very_secret_key' # Use a secret key for session management
app.config["MONGO_URI"] = "mongodb://localhost:27017/medicate_db"
mongo= PyMongo(app)
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
        username = request.form.get('username')  # must match form field name
        email = request.form.get('email')
        password = request.form.get('password')

        existing_user = mongo.db.users.find_one({"email": email})
        if existing_user:
            flash("Email already registered!", "error")
        else:
            # Insert new user
            mongo.db.users.insert_one({
                "username": username,
                "email": email,
                "password": password
            })

            # Save in session
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
            # ✅ Save the logged in user in session
            session['user'] = user['username']  
            flash(f"Welcome back, {user['username']}!", "success")
            return redirect(url_for('home'))
        else:
            flash("Invalid login details!", "error")
    
    return render_template('login.html')
@app.route('/logout')
def logout():
    session.pop('user', None)  # ✅ remove user from session
    flash("You have been logged out.", 'info')
    return redirect(url_for('home'))



@app.route('/pharmacy-locator', methods=['GET', 'POST'])
def pharmacy_locator():
    pharmacies = []
    # This checks if the request method is POST (from a form submission)
    if request.method == 'POST':
        # Using .get() is a safe way to get form data without crashing
        query = request.form.get('pincode')
        if query:
            # Filter the dummy data based on the submitted pincode
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

if __name__ == '__main__':
    app.run(debug=True)