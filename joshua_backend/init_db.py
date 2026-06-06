import json
import os
import datetime
from app import app, mysql

def init_database():
    with app.app_context():
        cursor = mysql.connection.cursor()
        print("Starting Database Initialization...")

        # 1. Create Users Table
        try:
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    is_verified BOOLEAN DEFAULT FALSE,
                    otp_code VARCHAR(10) DEFAULT NULL,
                    otp_expires_at DATETIME DEFAULT NULL,
                    role VARCHAR(50) DEFAULT 'user',
                    student_id VARCHAR(50) DEFAULT '',
                    faculty VARCHAR(100) DEFAULT '',
                    level VARCHAR(50) DEFAULT '',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ''')
            print("[✓] Users table verified/created.")
        except Exception as e:
            print(f"[✗] Error creating users table: {e}")

        # 2. Create Events Table
        try:
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS events (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    locationName VARCHAR(255),
                    date VARCHAR(50),
                    time VARCHAR(50),
                    status VARCHAR(50) DEFAULT 'upcoming',
                    image LONGTEXT,
                    author VARCHAR(255),
                    approval_status VARCHAR(50) DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ''')
            print("[✓] Events table verified/created.")
        except Exception as e:
            print(f"[✗] Error creating events table: {e}")

        # 3. Create Locations Table
        try:
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS locations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    type VARCHAR(255),
                    latitude FLOAT NOT NULL,
                    longitude FLOAT NOT NULL,
                    image LONGTEXT,
                    description TEXT,
                    approval_status VARCHAR(50) DEFAULT 'approved',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ''')
            print("[✓] Locations table verified/created.")
        except Exception as e:
            print(f"[✗] Error creating locations table: {e}")

        # 4. Create Saved Directions Table
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
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ''')
            print("[✓] Saved Directions table verified/created.")
        except Exception as e:
            print(f"[✗] Error creating saved_directions table: {e}")

        # 5. Create Audit Logs Table
        try:
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT DEFAULT NULL,
                    user_email VARCHAR(255) DEFAULT 'Guest',
                    action VARCHAR(255) NOT NULL,
                    details TEXT,
                    ip_address VARCHAR(45) DEFAULT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ''')
            print("[✓] Audit Logs table verified/created.")
        except Exception as e:
            print(f"[✗] Error creating audit_logs table: {e}")

        # 6. Seed locations from coordinates.json if table is empty
        try:
            cursor.execute("SELECT COUNT(*) FROM locations")
            count = cursor.fetchone()[0]
            if count == 0:
                file_path = os.path.join(os.path.dirname(__file__), 'coordinates.json')
                if os.path.exists(file_path):
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                        locations = data.get('locations', [])
                        for loc in locations:
                            name = loc.get('name')
                            loc_type = loc.get('type')
                            coords = loc.get('coordinate', {})
                            lat = coords.get('latitude')
                            lng = coords.get('longitude')
                            image = loc.get('image', '')
                            desc = loc.get('description', '')
                            cursor.execute('''
                                INSERT INTO locations (name, type, latitude, longitude, image, description, approval_status)
                                VALUES (%s, %s, %s, %s, %s, %s, 'approved')
                            ''', (name, loc_type, lat, lng, image, desc))
                    mysql.connection.commit()
                    print(f"[✓] Successfully seeded {len(locations)} locations from coordinates.json.")
                else:
                    print("[!] coordinates.json not found, skipping locations seeding.")
            else:
                print("[!] Locations table already contains data. Seeding skipped.")
        except Exception as e:
            print(f"[✗] Error seeding locations: {e}")

        mysql.connection.commit()
        cursor.close()
        print("\nDatabase Initialization Completed Successfully!")

if __name__ == "__main__":
    init_database()
