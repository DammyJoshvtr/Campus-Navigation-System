import random
import datetime
from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_mail import Mail, Message

import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "49494asdklfjasdklflaksdf")
CORS(app)  # Enable CORS for frontend

# Database Config
app.config['MYSQL_HOST'] = os.environ.get("MYSQL_HOST", "localhost")
app.config['MYSQL_USER'] = os.environ.get("MYSQL_USER", "root")
app.config['MYSQL_PASSWORD'] = os.environ.get("MYSQL_PASSWORD", "")
app.config['MYSQL_DB'] = os.environ.get("MYSQL_DB", "flask_database")

# Email Config (Using environment variables)
app.config['MAIL_SERVER'] = os.environ.get("MAIL_SERVER", 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get("MAIL_PORT", 587))
app.config['MAIL_USE_TLS'] = os.environ.get("MAIL_USE_TLS", "True").lower() in ("true", "1", "yes")
app.config['MAIL_USERNAME'] = os.environ.get("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.environ.get("MAIL_PASSWORD")
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get("MAIL_DEFAULT_SENDER")

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
    cursor.execute('SELECT id, is_verified FROM users WHERE email = %s', (email,))
    existing_user = cursor.fetchone()
    
    if existing_user:
        db_id, is_verified = existing_user
        if is_verified:
            cursor.close()
            return jsonify({"message": "Email already exists"}), 409
        else:
            # User exists but is not verified. Resend OTP and update password/name.
            hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
            otp = generate_otp()
            expires_at = datetime.datetime.now() + datetime.timedelta(minutes=10)
            
            try:
                cursor.execute(
                    'UPDATE users SET name=%s, password=%s, otp_code=%s, otp_expires_at=%s WHERE id=%s',
                    (name, hashed_password, otp, expires_at, db_id)
                )
                mysql.connection.commit()
            except Exception as e:
                cursor.close()
                return jsonify({"message": f"Database error: {e}"}), 500
            
            cursor.close()
            send_otp_email(email, otp)
            return jsonify({"message": "User updated. Please check your email for the OTP.", "email": email}), 201

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
    cursor.execute('SELECT id, name, is_verified, otp_code, otp_expires_at FROM users WHERE email = %s', (email,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        return jsonify({"message": "User not found"}), 404

    user_id, name, is_verified, db_otp, expires_at = user

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
    return jsonify({
        "message": "Email verified successfully",
        "user": {"id": user_id, "name": name, "email": email}
    }), 200

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
        otp = generate_otp()
        expires_at = datetime.datetime.now() + datetime.timedelta(minutes=10)
        cursor = mysql.connection.cursor()
        cursor.execute('UPDATE users SET otp_code=%s, otp_expires_at=%s WHERE id=%s', (otp, expires_at, db_id))
        mysql.connection.commit()
        cursor.close()
        send_otp_email(db_email, otp)
        return jsonify({"message": "Email not verified. A new OTP has been sent. Please verify your OTP."}), 403

    # For a real API, return a JWT token. Since the original relied on flask_login, 
    # we'll just return a success message and user object to satisfy the frontend.
    return jsonify({
        "message": "Login successful",
        "user": {"id": db_id, "name": db_name, "email": db_email}
    }), 200

@app.route('/api/auth/resend-otp', methods=['POST'])
def resend_otp():
    data = request.get_json(silent=True) or {}
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email is required"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id, is_verified FROM users WHERE email = %s', (email,))
    user_data = cursor.fetchone()

    if not user_data:
        cursor.close()
        return jsonify({"message": "User not found"}), 404

    db_id, is_verified = user_data

    if is_verified:
        cursor.close()
        return jsonify({"message": "Email is already verified"}), 400

    otp = generate_otp()
    expires_at = datetime.datetime.now() + datetime.timedelta(minutes=10)

    try:
        cursor.execute(
            'UPDATE users SET otp_code=%s, otp_expires_at=%s WHERE id=%s',
            (otp, expires_at, db_id)
        )
        mysql.connection.commit()
    except Exception as e:
        cursor.close()
        return jsonify({"message": f"Database error: {e}"}), 500

    cursor.close()
    send_otp_email(email, otp)

    return jsonify({"message": "OTP resent successfully."}), 200

# ==========================================
# SAVED DIRECTIONS API
# ==========================================

@app.route('/api/directions/save', methods=['POST'])
def save_direction():
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id')
    origin_name = data.get('origin_name')
    origin_lat = data.get('origin_lat')
    origin_lng = data.get('origin_lng')
    destination_name = data.get('destination_name')
    destination_lat = data.get('destination_lat')
    destination_lng = data.get('destination_lng')

    if not all([user_id, origin_name, origin_lat, origin_lng, destination_name, destination_lat, destination_lng]):
        return jsonify({"message": "All fields are required"}), 400

    cursor = mysql.connection.cursor()
    try:
        cursor.execute('''
            INSERT INTO saved_directions 
            (user_id, origin_name, origin_lat, origin_lng, destination_name, destination_lat, destination_lng)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        ''', (user_id, origin_name, origin_lat, origin_lng, destination_name, destination_lat, destination_lng))
        mysql.connection.commit()
        direction_id = cursor.lastrowid
        cursor.close()
        return jsonify({"message": "Direction saved successfully", "id": direction_id}), 201
    except Exception as e:
        cursor.close()
        return jsonify({"message": f"Failed to save direction: {str(e)}"}), 500


@app.route('/api/directions/<int:user_id>', methods=['GET'])
def get_saved_directions(user_id):
    cursor = mysql.connection.cursor()
    try:
        cursor.execute('''
            SELECT id, origin_name, origin_lat, origin_lng, destination_name, destination_lat, destination_lng, created_at
            FROM saved_directions
            WHERE user_id = %s
            ORDER BY created_at DESC
        ''', (user_id,))
        rows = cursor.fetchall()
        cursor.close()
        
        directions = []
        for row in rows:
            directions.append({
                "id": row[0],
                "origin_name": row[1],
                "origin_lat": row[2],
                "origin_lng": row[3],
                "destination_name": row[4],
                "destination_lat": row[5],
                "destination_lng": row[6],
                "created_at": str(row[7])
            })
            
        return jsonify({"directions": directions}), 200
    except Exception as e:
        cursor.close()
        return jsonify({"message": f"Failed to fetch directions: {str(e)}"}), 500


@app.route('/api/directions/<int:direction_id>', methods=['DELETE'])
def delete_direction(direction_id):
    cursor = mysql.connection.cursor()
    try:
        cursor.execute('DELETE FROM saved_directions WHERE id = %s', (direction_id,))
        mysql.connection.commit()
        cursor.close()
        return jsonify({"message": "Direction deleted successfully"}), 200
    except Exception as e:
        cursor.close()
        return jsonify({"message": f"Failed to delete direction: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
