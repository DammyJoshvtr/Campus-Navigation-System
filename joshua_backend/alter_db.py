from app import app, mysql

with app.app_context():
    cursor = mysql.connection.cursor()
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE")
        print("Added is_verified column.")
    except Exception as e:
        print(f"is_verified might already exist or error: {e}")

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN otp_code VARCHAR(10) DEFAULT NULL")
        print("Added otp_code column.")
    except Exception as e:
        print(f"otp_code might already exist or error: {e}")

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN otp_expires_at DATETIME DEFAULT NULL")
        print("Added otp_expires_at column.")
    except Exception as e:
        print(f"otp_expires_at might already exist or error: {e}")

    mysql.connection.commit()
    cursor.close()
    print("Database alteration complete.")
