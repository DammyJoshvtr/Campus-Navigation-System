import random
import datetime
from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_mail import Mail, Message
import jwt
from werkzeug.utils import secure_filename
from functools import wraps

import json
import os
from dotenv import load_dotenv

load_dotenv()

# Environment variable debugging
import sys
print("--- ENVIRONMENT VARIABLES DEBUG ---", file=sys.stderr, flush=True)
print(f"MYSQL_HOST: {os.environ.get('MYSQL_HOST')}", file=sys.stderr, flush=True)
print(f"MYSQL_PORT: {os.environ.get('MYSQL_PORT')}", file=sys.stderr, flush=True)
print(f"MYSQL_USER: {os.environ.get('MYSQL_USER')}", file=sys.stderr, flush=True)
print(f"MYSQL_DB: {os.environ.get('MYSQL_DB')}", file=sys.stderr, flush=True)
print("-----------------------------------", file=sys.stderr, flush=True)

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "49494asdklfjasdklflaksdf")
CORS(app)  # Enable CORS for frontend

# Database Config
app.config['MYSQL_HOST'] = os.environ.get("MYSQL_HOST", "localhost")
app.config['MYSQL_PORT'] = int(os.environ.get("MYSQL_PORT", 3306))
app.config['MYSQL_USER'] = os.environ.get("MYSQL_USER", "root")
app.config['MYSQL_PASSWORD'] = os.environ.get("MYSQL_PASSWORD", "")
app.config['MYSQL_DB'] = os.environ.get("MYSQL_DB", "flask_database")

# Email Config (Using environment variables)
app.config['MAIL_SERVER'] = os.environ.get("MAIL_SERVER", 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get("MAIL_PORT", 587))
app.config['MAIL_USE_TLS'] = os.environ.get("MAIL_USE_TLS", "True").lower() in ("true", "1", "yes")
app.config['MAIL_USE_SSL'] = os.environ.get("MAIL_USE_SSL", "False").lower() in ("true", "1", "yes")
app.config['MAIL_USERNAME'] = os.environ.get("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.environ.get("MAIL_PASSWORD")
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get("MAIL_DEFAULT_SENDER")

# Upload Config
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'images')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

mysql = MySQL(app)
bcrypt = Bcrypt(app)
mail = Mail(app)

def log_activity(user_id=None, user_email=None, action="", details=""):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute('''
            INSERT INTO audit_logs (user_id, user_email, action, details, ip_address)
            VALUES (%s, %s, %s, %s, %s)
        ''', (user_id, user_email or 'Guest', action, details, request.remote_addr))
        mysql.connection.commit()
        cursor.close()
    except Exception as e:
        print(f"Failed to write audit log: {e}")

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

# JWT Decorators
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1] if "Bearer " in request.headers['Authorization'] else request.headers['Authorization']
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.secret_key, algorithms=["HS256"])
            current_user = data
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1] if "Bearer " in request.headers['Authorization'] else request.headers['Authorization']
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.secret_key, algorithms=["HS256"])
            if data.get('role') != 'admin':
                return jsonify({'message': 'Admin privileges required!'}), 403
            current_user = data
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/')
def index():
    return jsonify({"message": "Joshua Backend API running"})

@app.route('/api/upload', methods=['POST'])
@admin_required
def upload_file(current_user):
    if 'image' not in request.files:
        return jsonify({"message": "No image part"}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    if file:
        import base64
        file_content = file.read()
        encoded = base64.b64encode(file_content).decode('utf-8')
        mime_type = file.mimetype or 'image/jpeg'
        base64_url = f"data:{mime_type};base64,{encoded}"
        return jsonify({"message": "File uploaded successfully", "url": base64_url}), 200

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json(silent=True) or {}
    name = data.get('fullname') or data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"message": "Missing required fields"}), 400

    if not email.lower().endswith('@run.edu.ng'):
        return jsonify({"message": "Only @run.edu.ng emails are allowed"}), 403

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id, is_verified FROM users WHERE email = %s', (email,))
    existing_user = cursor.fetchone()
    
    if existing_user:
        db_id, is_verified = existing_user
        if is_verified:
            cursor.close()
            return jsonify({"message": "Email already exists"}), 409
        else:
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
            log_activity(user_id=db_id, user_email=email, action="User Signup Initiated", details=f"Re-sent OTP for signup to {email}")
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
    
    # Fetch user id for logging
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
    user_id = cursor.fetchone()[0]
    cursor.close()
    send_otp_email(email, otp)
    log_activity(user_id=user_id, user_email=email, action="User Signup Initiated", details=f"Registered and sent verification OTP to {email}")
    return jsonify({"message": "User created. Please check your email for the OTP.", "email": email}), 201

@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return jsonify({"message": "Email and OTP are required"}), 400

    cursor = mysql.connection.cursor()
    
    try:
        cursor.execute('SELECT id, name, is_verified, otp_code, otp_expires_at, role, student_id, faculty, level FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()
    except:
        # fallback if new columns don't exist yet
        cursor.execute('SELECT id, name, is_verified, otp_code, otp_expires_at FROM users WHERE email = %s', (email,))
        user_no_role = cursor.fetchone()
        if user_no_role:
            user = (*user_no_role, 'user', '', '', '')
        else:
            user = None

    if not user:
        cursor.close()
        return jsonify({"message": "User not found"}), 404

    user_id, name, is_verified, db_otp, expires_at, role, student_id, faculty, level = user

    if is_verified:
        cursor.close()
        return jsonify({"message": "Account already verified"}), 400

    if db_otp != otp:
        cursor.close()
        return jsonify({"message": "Invalid OTP"}), 400

    if expires_at and datetime.datetime.now() > expires_at:
        cursor.close()
        return jsonify({"message": "OTP has expired"}), 400

    cursor.execute('UPDATE users SET is_verified = True, otp_code = NULL WHERE id = %s', (user_id,))
    mysql.connection.commit()
    cursor.close()
    log_activity(user_id=user_id, user_email=email, action="User Signup Verified", details=f"Email {email} successfully verified via OTP.")

    token = jwt.encode({
        'id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.secret_key, algorithm="HS256")

    return jsonify({
        "message": "Email verified successfully",
        "user": {
            "id": user_id, "name": name, "email": email, "role": role,
            "studentId": student_id, "faculty": faculty, "level": level
        },
        "token": token
    }), 200

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    cursor = mysql.connection.cursor()
    try:
        cursor.execute('SELECT id, name, email, password, is_verified, role, student_id, faculty, level FROM users WHERE email = %s', (email,))
        user_data = cursor.fetchone()
    except:
        cursor.execute('SELECT id, name, email, password, is_verified FROM users WHERE email = %s', (email,))
        u = cursor.fetchone()
        if u:
            user_data = (*u, 'user', '', '', '')
        else:
            user_data = None
    cursor.close()

    if not user_data:
        return jsonify({"message": "Invalid credentials"}), 401

    db_id, db_name, db_email, db_password, is_verified, role, student_id, faculty, level = user_data

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

    token = jwt.encode({
        'id': db_id,
        'email': db_email,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.secret_key, algorithm="HS256")
    log_activity(user_id=db_id, user_email=db_email, action="User Login", details=f"User successfully logged in. Role: {role}")

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": db_id, "name": db_name, "email": db_email, "role": role,
            "studentId": student_id, "faculty": faculty, "level": level
        },
        "token": token
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

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email is required"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
    user_data = cursor.fetchone()

    if not user_data:
        cursor.close()
        return jsonify({"message": "User not found"}), 404

    db_id = user_data[0]

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
    log_activity(user_id=db_id, user_email=email, action="Forgot Password OTP Sent", details=f"Generated and sent OTP code for password reset to {email}")

    return jsonify({"message": "Reset code sent successfully."}), 200

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    otp = data.get('otp')
    password = data.get('password')

    if not email or not otp or not password:
        return jsonify({"message": "Email, OTP, and new password are required"}), 400

    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id, otp_code, otp_expires_at FROM users WHERE email = %s', (email,))
    user_data = cursor.fetchone()

    if not user_data:
        cursor.close()
        return jsonify({"message": "User not found"}), 404

    db_id, db_otp, expires_at = user_data

    if db_otp != otp:
        cursor.close()
        return jsonify({"message": "Invalid OTP code"}), 400

    if expires_at and datetime.datetime.now() > expires_at:
        cursor.close()
        return jsonify({"message": "OTP has expired"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        cursor.execute(
            'UPDATE users SET password=%s, otp_code=NULL, otp_expires_at=NULL WHERE id=%s',
            (hashed_password, db_id)
        )
        mysql.connection.commit()
    except Exception as e:
        cursor.close()
        return jsonify({"message": f"Database error: {e}"}), 500

    cursor.close()
    log_activity(user_id=db_id, user_email=email, action="Password Reset Successful", details=f"Password reset successfully verified via OTP for {email}")

    return jsonify({"message": "Password reset successfully."}), 200

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
        try:
            cursor2 = mysql.connection.cursor()
            cursor2.execute('SELECT email FROM users WHERE id = %s', (user_id,))
            email_row = cursor2.fetchone()
            user_email = email_row[0] if email_row else None
            cursor2.close()
        except:
            user_email = None
        log_activity(user_id=user_id, user_email=user_email, action="Save Route", details=f"Saved route from '{origin_name}' to '{destination_name}'")
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
    try:
        cursor2 = mysql.connection.cursor()
        cursor2.execute('SELECT user_id, origin_name, destination_name FROM saved_directions WHERE id = %s', (direction_id,))
        row = cursor2.fetchone()
        cursor2.close()
        if row:
            u_id, orig, dest = row
            cursor3 = mysql.connection.cursor()
            cursor3.execute('SELECT email FROM users WHERE id = %s', (u_id,))
            e_row = cursor3.fetchone()
            cursor3.close()
            u_email = e_row[0] if e_row else None
            log_activity(user_id=u_id, user_email=u_email, action="Delete Route", details=f"Deleted saved route ID: {direction_id} ('{orig}' to '{dest}')")
    except Exception as e_log:
        print(f"Log error in delete direction: {e_log}")

    cursor = mysql.connection.cursor()
    try:
        cursor.execute('DELETE FROM saved_directions WHERE id = %s', (direction_id,))
        mysql.connection.commit()
        cursor.close()
        return jsonify({"message": "Direction deleted successfully"}), 200
    except Exception as e:
        cursor.close()
        return jsonify({"message": f"Failed to delete direction: {str(e)}"}), 500


# ==========================================
# EVENTS API
# ==========================================

@app.route('/api/events/create', methods=['POST'])
def create_event():
    data = request.get_json(silent=True) or {}
    title = data.get('title')
    description = data.get('description')
    locationName = data.get('locationName')
    date = data.get('date')
    time = data.get('time')
    status = data.get('status', 'upcoming')
    image = data.get('image')
    author = data.get('author')

    if not title:
        return jsonify({"message": "Title is required"}), 400

    cursor = mysql.connection.cursor()
    try:
        cursor.execute('''
            INSERT INTO events 
            (title, description, locationName, date, time, status, image, author, approval_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending')
        ''', (title, description, locationName, date, time, status, image, author))
        mysql.connection.commit()
        event_id = cursor.lastrowid
        cursor.close()
        
        user_id = None
        user_email = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1] if "Bearer " in request.headers['Authorization'] else request.headers['Authorization']
                data_token = jwt.decode(token, app.secret_key, algorithms=["HS256"])
                user_id = data_token.get('id')
                user_email = data_token.get('email')
            except:
                pass
        log_activity(user_id=user_id, user_email=user_email or author, action="Create Event Request", details=f"Created pending event request '{title}' at '{locationName}'")
        
        return jsonify({"message": "Event created successfully", "id": event_id}), 201
    except Exception as e:
        # Fallback if approval_status is not yet added
        try:
            cursor.execute('''
                INSERT INTO events 
                (title, description, locationName, date, time, status, image, author)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', (title, description, locationName, date, time, status, image, author))
            mysql.connection.commit()
            event_id = cursor.lastrowid
            cursor.close()
            return jsonify({"message": "Event created successfully", "id": event_id}), 201
        except Exception as e2:
            cursor.close()
            return jsonify({"message": f"Failed to create event: {str(e2)}"}), 500

@app.route('/api/events', methods=['GET'])
def get_events():
    all_events = request.args.get('all') == 'true'
    cursor = mysql.connection.cursor()
    try:
        if all_events:
            cursor.execute('''
                SELECT id, title, description, locationName, date, time, status, image, author, created_at, approval_status
                FROM events ORDER BY created_at DESC
            ''')
        else:
            cursor.execute('''
                SELECT id, title, description, locationName, date, time, status, image, author, created_at, approval_status
                FROM events WHERE approval_status = 'approved' ORDER BY created_at DESC
            ''')
        rows = cursor.fetchall()
        cursor.close()
        
        events_list = []
        for row in rows:
            events_list.append({
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "locationName": row[3],
                "date": row[4],
                "time": row[5],
                "status": row[6],
                "image": row[7],
                "author": row[8],
                "created_at": str(row[9]),
                "approval_status": row[10]
            })
            
        return jsonify({"events": events_list}), 200
    except Exception as e:
        # Fallback if approval_status not in db yet
        try:
            cursor = mysql.connection.cursor()
            cursor.execute('''
                SELECT id, title, description, locationName, date, time, status, image, author, created_at
                FROM events ORDER BY created_at DESC
            ''')
            rows = cursor.fetchall()
            events_list = []
            for row in rows:
                events_list.append({
                    "id": row[0],
                    "title": row[1],
                    "description": row[2],
                    "locationName": row[3],
                    "date": row[4],
                    "time": row[5],
                    "status": row[6],
                    "image": row[7],
                    "author": row[8],
                    "created_at": str(row[9]),
                    "approval_status": 'approved'
                })
            return jsonify({"events": events_list}), 200
        except Exception as e2:
            cursor.close()
            return jsonify({"message": f"Failed to fetch events: {str(e2)}"}), 500

@app.route('/api/events/<int:id>', methods=['DELETE'])
@admin_required
def delete_event(current_user, id):
    cursor = mysql.connection.cursor()
    try:
        cursor.execute('DELETE FROM events WHERE id = %s', (id,))
        mysql.connection.commit()
        cursor.close()
        return jsonify({"message": "Event deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to delete event: {str(e)}"}), 500

@app.route('/api/events/<int:id>', methods=['PUT'])
@admin_required
def update_event(current_user, id):
    data = request.get_json()
    cursor = mysql.connection.cursor()
    try:
        cursor.execute('''
            UPDATE events 
            SET title=%s, description=%s, locationName=%s, date=%s, time=%s, status=%s, image=%s
            WHERE id=%s
        ''', (data.get('title'), data.get('description'), data.get('locationName'), data.get('date'), data.get('time'), data.get('status'), data.get('image'), id))
        mysql.connection.commit()
        cursor.close()
        return jsonify({"message": "Event updated successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to update event: {str(e)}"}), 500

# ==========================================
# LOCATIONS API
# ==========================================

@app.route('/api/locations', methods=['GET'])
def get_locations():
    all_locations = request.args.get('all') == 'true'
    cursor = mysql.connection.cursor()
    try:
        if all_locations:
            cursor.execute('SELECT id, name, type, latitude, longitude, image, description, approval_status, floorplan FROM locations')
        else:
            cursor.execute("SELECT id, name, type, latitude, longitude, image, description, approval_status, floorplan FROM locations WHERE approval_status = 'approved'")
        rows = cursor.fetchall()
        cursor.close()
        
        locations_list = []
        for row in rows:
            locations_list.append({
                "id": row[0],
                "name": row[1],
                "type": row[2],
                "coordinate": {
                    "latitude": row[3],
                    "longitude": row[4]
                },
                "image": row[5],
                "description": row[6],
                "approval_status": row[7],
                "floorplan": row[8]
            })
            
        return jsonify(locations_list), 200
    except Exception as e:
        # Fallback to coordinates.json if DB not migrated
        try:
            file_path = os.path.join(os.path.dirname(__file__), 'coordinates.json')
            with open(file_path, 'r') as f:
                data = json.load(f)
            return jsonify(data.get('locations', [])), 200
        except Exception as e2:
            return jsonify({"message": f"Failed to fetch locations: {str(e)}"}), 500

@app.route('/api/locations', methods=['POST'])
@admin_required
def create_location(current_user):
    data = request.get_json()
    cursor = mysql.connection.cursor()
    try:
        cursor.execute('''
            INSERT INTO locations (name, type, latitude, longitude, image, description, approval_status, floorplan)
            VALUES (%s, %s, %s, %s, %s, %s, 'approved', %s)
        ''', (data.get('name'), data.get('type'), data.get('latitude'), data.get('longitude'), data.get('image'), data.get('description'), data.get('floorplan')))
        mysql.connection.commit()
        loc_id = cursor.lastrowid
        cursor.close()
        log_activity(user_id=current_user.get('id'), user_email=current_user.get('email'), action="Create Location", details=f"Admin created location '{data.get('name')}' (Type: {data.get('type')})")
        return jsonify({"message": "Location created successfully", "id": loc_id}), 201
    except Exception as e:
        return jsonify({"message": f"Failed to create location: {str(e)}"}), 500

@app.route('/api/locations/<int:id>', methods=['PUT'])
@admin_required
def update_location(current_user, id):
    data = request.get_json()
    cursor = mysql.connection.cursor()
    try:
        cursor.execute('''
            UPDATE locations 
            SET name=%s, type=%s, latitude=%s, longitude=%s, image=%s, description=%s, floorplan=%s
            WHERE id=%s
        ''', (data.get('name'), data.get('type'), data.get('latitude'), data.get('longitude'), data.get('image'), data.get('description'), data.get('floorplan'), id))
        mysql.connection.commit()
        cursor.close()
        log_activity(user_id=current_user.get('id'), user_email=current_user.get('email'), action="Update Location", details=f"Admin updated location ID: {id} ('{data.get('name')}')")
        return jsonify({"message": "Location updated successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to update location: {str(e)}"}), 500

@app.route('/api/locations/<int:id>', methods=['DELETE'])
@admin_required
def delete_location(current_user, id):
    cursor = mysql.connection.cursor()
    try:
        cursor.execute('DELETE FROM locations WHERE id = %s', (id,))
        mysql.connection.commit()
        cursor.close()
        log_activity(user_id=current_user.get('id'), user_email=current_user.get('email'), action="Delete Location", details=f"Admin deleted location ID: {id}")
        return jsonify({"message": "Location deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to delete location: {str(e)}"}), 500

# ==========================================
# ADMIN API (USERS & APPROVALS)
# ==========================================

@app.route('/api/users', methods=['GET'])
@admin_required
def get_users(current_user):
    cursor = mysql.connection.cursor()
    try:
        cursor.execute('SELECT id, name, email, is_verified, role FROM users')
        rows = cursor.fetchall()
        cursor.close()
        users = []
        for row in rows:
            users.append({
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "is_verified": bool(row[3]),
                "role": row[4]
            })
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"message": f"Failed to fetch users: {str(e)}"}), 500

@app.route('/api/users/<int:id>', methods=['DELETE'])
@admin_required
def delete_user(current_user, id):
    cursor = mysql.connection.cursor()
    try:
        cursor.execute('DELETE FROM users WHERE id = %s', (id,))
        mysql.connection.commit()
        cursor.close()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to delete user: {str(e)}"}), 500

@app.route('/api/users/<int:id>/role', methods=['PUT'])
@admin_required
def update_user_role(current_user, id):
    data = request.get_json()
    new_role = data.get('role')
    
    if new_role not in ['admin', 'user']:
        return jsonify({"message": "Invalid role specified"}), 400

    # Prevent admin from changing their own role to prevent lockout
    if current_user.get('id') == id:
        return jsonify({"message": "You cannot change your own role"}), 400

    cursor = mysql.connection.cursor()
    try:
        cursor.execute("UPDATE users SET role = %s WHERE id = %s", (new_role, id))
        mysql.connection.commit()
        cursor.close()
        return jsonify({"message": f"User role updated to {new_role}"}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to update role: {str(e)}"}), 500

@app.route('/api/admin/approve/<content_type>/<int:id>', methods=['PUT'])
@admin_required
def approve_content(current_user, content_type, id):
    data = request.get_json()
    status = data.get('status')
    if status not in ['approved', 'rejected', 'pending']:
        return jsonify({"message": "Invalid status"}), 400
    
    cursor = mysql.connection.cursor()
    try:
        if content_type == 'event':
            cursor.execute("UPDATE events SET approval_status = %s WHERE id = %s", (status, id))
        elif content_type == 'location':
            cursor.execute("UPDATE locations SET approval_status = %s WHERE id = %s", (status, id))
        else:
            return jsonify({"message": "Invalid content type"}), 400
        
        mysql.connection.commit()
        cursor.close()
        log_activity(user_id=current_user.get('id'), user_email=current_user.get('email'), action="Content Approval Change", details=f"Admin updated {content_type} ID {id} status to {status}")
        return jsonify({"message": f"{content_type.capitalize()} status updated to {status}"}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to update status: {str(e)}"}), 500

@app.route('/api/users/<int:id>/profile', methods=['PUT'])
@token_required
def update_user_profile(current_user, id):
    if current_user.get('id') != id and current_user.get('role') != 'admin':
        return jsonify({"message": "Unauthorized"}), 403
        
    data = request.get_json()
    cursor = mysql.connection.cursor()
    try:
        cursor.execute('''
            UPDATE users 
            SET name=%s, student_id=%s, faculty=%s, level=%s
            WHERE id=%s
        ''', (data.get('name'), data.get('studentId'), data.get('faculty'), data.get('level'), id))
        mysql.connection.commit()
        cursor.close()
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to update profile: {str(e)}"}), 500

@app.route('/api/users/<int:id>/stats', methods=['GET'])
@token_required
def get_user_stats(current_user, id):
    cursor = mysql.connection.cursor()
    try:
        cursor.execute("SELECT name FROM users WHERE id = %s", (id,))
        user_row = cursor.fetchone()
        if not user_row:
            return jsonify({"message": "User not found"}), 404
            
        user_name = user_row[0]
        
        # Count saved directions
        cursor.execute("SELECT COUNT(*) FROM saved_directions WHERE user_id = %s", (id,))
        routes_count = cursor.fetchone()[0]
        
        # Count events authored
        cursor.execute("SELECT COUNT(*) FROM events WHERE author = %s", (user_name,))
        events_count = cursor.fetchone()[0]
        
        cursor.close()
        return jsonify({
            "routes": routes_count,
            "saved": 0, # Placeholder since we don't have a saved places table
            "events": events_count
        }), 200
    except Exception as e:
        return jsonify({"message": f"Failed to fetch stats: {str(e)}"}), 500

@app.route('/api/admin/audit-logs', methods=['GET'])
@admin_required
def get_audit_logs(current_user):
    cursor = mysql.connection.cursor()
    try:
        cursor.execute('''
            SELECT id, user_id, user_email, action, details, ip_address, created_at
            FROM audit_logs
            ORDER BY created_at DESC
            LIMIT 200
        ''')
        rows = cursor.fetchall()
        cursor.close()
        
        logs = []
        for row in rows:
            logs.append({
                "id": row[0],
                "user_id": row[1],
                "user_email": row[2],
                "action": row[3],
                "details": row[4],
                "ip_address": row[5],
                "created_at": str(row[6])
            })
        return jsonify(logs), 200
    except Exception as e:
        cursor.close()
        return jsonify({"message": f"Failed to fetch audit logs: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
