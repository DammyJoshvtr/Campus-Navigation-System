import random
import datetime
from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_mail import Mail, Message

app = Flask(__name__)
app.secret_key = "49494asdklfjasdklflaksdf"
CORS(app)  # Enable CORS for frontend

# Database Config
app.config['MYSQL_HOST'] = "localhost"
app.config['MYSQL_USER'] = "root"
app.config['MYSQL_PASSWORD'] = ""
app.config['MYSQL_DB'] = "flask_database"

# Email Config (Replace with real credentials or leave for testing)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your-email@gmail.com'
app.config['MAIL_PASSWORD'] = 'your-app-password'
app.config['MAIL_DEFAULT_SENDER'] = 'your-email@gmail.com'

mysql = MySQL(app)
bcrypt = Bcrypt(app)
mail = Mail(app)

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(to_email, otp):
    print(f"\n==========================================")
    print(f"TESTING - OTP for {to_email} is: {otp}")
    print(f"==========================================\n")
    try:
        msg = Message("Your Verification Code", recipients=[to_email])
        msg.body = f"Your verification code is: {otp}"
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@app.route('/')
def index():
    return jsonify({"message": "Joshua Backend API running"})

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json(silent=True) or {}
    name = data.get('fullname') or data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"message": "Missing required fields"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
    if cursor.fetchone():
        cursor.close()
        return jsonify({"message": "Email already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    otp = generate_otp()
    expires_at = datetime.datetime.now() + datetime.timedelta(minutes=10)

    try:
        cursor.execute(
            '''INSERT INTO users (name, email, password, is_verified, otp_code, otp_expires_at) 
               VALUES (%s, %s, %s, False, %s, %s)''',
            (name, email, hashed_password, otp, expires_at)
        )
        mysql.connection.commit()
    except Exception as e:
        cursor.close()
        return jsonify({"message": f"Database error: {e}"}), 500
    
    cursor.close()

    # Send OTP
    send_otp_email(email, otp)

    return jsonify({"message": "User created. Please check your email for the OTP.", "email": email}), 201

@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return jsonify({"message": "Email and OTP are required"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id, is_verified, otp_code, otp_expires_at FROM users WHERE email = %s', (email,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        return jsonify({"message": "User not found"}), 404

    user_id, is_verified, db_otp, expires_at = user

    if is_verified:
        cursor.close()
        return jsonify({"message": "Account already verified"}), 400

    if db_otp != otp:
        cursor.close()
        return jsonify({"message": "Invalid OTP"}), 400

    if expires_at and datetime.datetime.now() > expires_at:
        cursor.close()
        return jsonify({"message": "OTP has expired"}), 400

    # Mark as verified
    cursor.execute('UPDATE users SET is_verified = True, otp_code = NULL WHERE id = %s', (user_id,))
    mysql.connection.commit()
    cursor.close()

    # Provide token or session here if needed, for now just success
    return jsonify({"message": "Email verified successfully"}), 200

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id, name, email, password, is_verified FROM users WHERE email = %s', (email,))
    user_data = cursor.fetchone()
    cursor.close()

    if not user_data:
        return jsonify({"message": "Invalid credentials"}), 401

    db_id, db_name, db_email, db_password, is_verified = user_data

    if not bcrypt.check_password_hash(db_password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    if not is_verified:
        return jsonify({"message": "Email not verified. Please verify your OTP."}), 403

    # For a real API, return a JWT token. Since the original relied on flask_login, 
    # we'll just return a success message and user object to satisfy the frontend.
    return jsonify({
        "message": "Login successful",
        "user": {"id": db_id, "name": db_name, "email": db_email}
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)