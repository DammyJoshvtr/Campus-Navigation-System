import os
import pathlib

from flask import Flask, request, render_template, redirect, url_for, abort
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
import random
import smtplib
from email.message import EmailMessage
from flask import session
import time
import requests
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from pip._vendor import cachecontrol
import google.auth.transport.requests


app = Flask(__name__)
app.secret_key = "49494asdklfjasdklflaksdf"

app.config['MYSQL_HOST'] = "localhost"
app.config['MYSQL_USER'] = "root"
app.config['MYSQL_PASSWORD'] = "Techpro16MAX#"
app.config['MYSQL_DB'] = "flask_database"

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

GOOGLE_CLIENT_ID = "790278295698-vsbsorlgiha556ok50m8ce9v8p05rm44.apps.googleusercontent.com"
client_secrets_file = os.path.join(pathlib.Path(__file__).parent, "client_secret_790278295698-vsbsorlgiha556ok50m8ce9v8p05rm44.apps.googleusercontent.com.json")

flow = Flow.from_client_secrets_file(client_secrets_file=client_secrets_file,
                                     scopes=["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "openid"],
                                     redirect_uri="http://127.0.0.1:5000/callback"
                                    )

mysql = MySQL(app)
login_manage = LoginManager()
login_manage.init_app(app)
bcrypt = Bcrypt(app)

def send_otp(email):
    otp = ""
    for i in range(6):
        otp += str(random.randint(0,9))
    
    session['otp'] = otp
    session['otp_expiry'] = time.time() + 300

    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    #server.starttls()

    from_mail = "runnavigation@gmail.com"
    server.login(from_mail, 'zrqe rwgi cect tply')
    user = email

    msg = EmailMessage()
    msg['Subject'] = "OTP verification"
    msg['From'] = from_mail
    msg['To'] = user
    msg.set_content("Your OTP is\n " + otp)

    msg.add_alternative(f"""
        <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>OTP Verification</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 20px;">
        
            <!-- Container -->
            <table width="100%" max-width="500px" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:8px; padding:20px;">
          
              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <h2 style="margin:0; color:#333;">Verify Your Account</h2>
                </td>
              </tr>

              <!-- Message -->
              <tr>
                <td style="color:#555; font-size:16px; line-height:1.5;">
                  <p>Hello,</p>
                  <p>Use the One-Time Password (OTP) below to verify your account. This code is valid for the next 10 minutes.</p>
                </td>
              </tr>

              <!-- OTP Box -->
              <tr>
                <td align="center" style="padding: 20px 0;">
                  <div style="display:inline-block; padding:15px 25px; font-size:24px; letter-spacing:5px; background:#f0f0f0; border-radius:6px; font-weight:bold; color:#333;">
                    {otp}
                  </div>
                </td>
              </tr>

              <!-- Footer Message -->
              <tr>
                <td style="color:#777; font-size:14px; line-height:1.5;">
                  <p>If you didn’t request this code, you can safely ignore this email.</p>
                  <p>Thanks,<br>Your Company Team</p>
                </td>
              </tr>

            </table>

            <!-- Footer -->
            <table width="100%" max-width="500px" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
              <tr>
                <td align="center" style="font-size:12px; color:#aaa;">
                  © 2026 Your Company. All rights reserved.
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
        """, subtype = 'html'

    )

    server.send_message(msg)

def login_is_required(function):
    def wrapper(*args, **kwargs):
        if "google_id" not in session:
            return abort(401, description="Authorization required")
        else:
            return function()
        
    return wrapper

#User Loader functions
@login_manage.user_loader
def load_user(user_id):
    return User.get(user_id)

class User(UserMixin):
    def __init__(self, user_id, name, email):
        self.id =  user_id
        self.name = name
        self.email = email

    @staticmethod
    def get(user_id):
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT name, email from users where id = %s', (user_id,))
        result = cursor.fetchone()
        cursor.close()
        if result:
            return User(user_id, result[0], result[1])


@app.route('/')
def index():
    return 'Home page'

@app.route('/login', methods = ['GET','POST'])
def login():
    if request.method == 'POST':
        
        email = request.form['email']
        password = request.form['password']

        cursor = mysql.connection.cursor()

        cursor.execute('SELECT id, name, email, password from users where email = %s', (email,))
        user_data = cursor.fetchone()
        cursor.close()

        if user_data and bcrypt.check_password_hash(user_data[3], password):
            user = User(user_data[0],user_data[1],user_data[2])
            login_user(user)
            return redirect(url_for('dashboard_backup'))
        

    return render_template('login.html')

@app.route("/Goo_login")
def Goo_login():
    authorization_url, state = flow.authorization_url()
    session["state"] = state
    return redirect(authorization_url)

@app.route("/callback")
def callback():
    flow.fetch_token(authorization_response=request.url)

    if not session["state"] == request.args["state"]:
        abort(500) # State does not match!

    credentials = flow.credentials
    request_session = requests.session()
    cached_session = cachecontrol.CacheControl(request_session)
    token_request = google.auth.transport.requests.Request(session=cached_session)

    id_info = id_token.verify_oauth2_token(
        id_token=credentials._id_token,
        request=token_request,
        audience=GOOGLE_CLIENT_ID
    )

    session["google_id"] = id_info.get("sub")
    session["email"] = id_info.get("email")
    session["name"] = id_info.get("name")
    return redirect("/dashboard")


@app.route('/register', methods = ['GET','POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        cursor = mysql.connection.cursor()

        cursor.execute('INSERT INTO users (name,email,password) values(%s,%s,%s)',(name,email,
                                                                                   hashed_password))
        mysql.connection.commit()
        cursor.close()
        send_otp(email)
        return redirect(url_for('OTP_verification'))

    return render_template('register.html')

@app.route('/dashboard')
@login_is_required
def dashboard():
    user_email = session.get("email")
    user_name = session.get("name")
    return render_template('dashboard.html', name=user_name, email=user_email)

@app.route('/dashboard_backup')
@login_required
def dashboard_backup():
    return render_template('dashboard.html')

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/OTP_verification', methods=['GET', 'POST'])
def OTP_verification():
    if request.method == 'POST':
        otp1 = ''.join([
            request.form.get(f'otp{i}') for i in range(1, 7)
        ])

        if otp1 == session.get('otp'):
            return redirect(url_for('login'))
        else:
            return render_template('OTP.html', error="Invalid OTP")

    return render_template('OTP.html')


@app.route('/resend')
def resend_otp():
    return "OTP Resent!"

if __name__ == '__main__':
    app.run(debug=True)
# git push -u origin HEAD 