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

    try:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS saved_directions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                origin_name VARCHAR(255) NOT NULL,
                origin_lat FLOAT NOT NULL,
                origin_lng FLOAT NOT NULL,
                destination_name VARCHAR(255) NOT NULL,
                destination_lat FLOAT NOT NULL,
                destination_lng FLOAT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ''')
        print("Created saved_directions table.")
    except Exception as e:
        print(f"saved_directions error: {e}")

    mysql.connection.commit()
    cursor.close()
    print("Database alteration complete.")
