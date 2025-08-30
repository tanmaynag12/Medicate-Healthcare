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


if __name__ == '__main__':
    app.run(debug=True)