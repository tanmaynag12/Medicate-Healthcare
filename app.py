from flask import Flask, redirect, request, jsonify, render_template, url_for
app = Flask(__name__)   
@app.route('/')
def home():
    return render_template('home.html')
@app.route('/signup')
def signup():
    return render_template('signup.html')
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # handle login logic here
        return redirect(url_for('home'))
    return render_template('login.html')
@app.route('/pharmacy-locator', methods=['GET', 'POST'])
def pharmacy_locator():
    pharmacies = []  # Empty list for now

    if request.method == 'POST':
        query = request.form.get('pincode')
        # 🔹 Later: fetch from MongoDB using query
        # For now, add dummy results to display
        pharmacies = [
            {"name": "Medicare Pharmacy", "address": "MG Road, Bangalore", "contact": "9876543210"},
            {"name": "Apollo Pharmacy", "address": "Koramangala, Bangalore", "contact": "9988776655"},
            {"name": "Wellness Pharmacy", "address": "Indiranagar, Bangalore", "contact": "9123456780"}
        ]
    
    return render_template("pharmacy_locator.html", pharmacies=pharmacies)

@app.route('/book_appointment')
def book_appointment():
    return render_template("book_appointment.html")



if __name__ == '__main__':
    app.run(debug=True)