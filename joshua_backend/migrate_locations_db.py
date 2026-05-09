import json
import os
from app import app, mysql

with app.app_context():
    cursor = mysql.connection.cursor()
    
    # Create locations table
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
            )
        ''')
        print("Created locations table.")
    except Exception as e:
        print(f"locations table error: {e}")

    # Read existing coordinates.json and insert if table is empty
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
                        
                        cursor.execute('''
                            INSERT INTO locations (name, type, latitude, longitude, image, approval_status)
                            VALUES (%s, %s, %s, %s, %s, 'approved')
                        ''', (name, loc_type, lat, lng, image))
                
                print(f"Imported {len(locations)} locations from coordinates.json.")
            else:
                print("coordinates.json not found.")
        else:
            print("locations table already contains data, skipping import.")
    except Exception as e:
        print(f"Error during data migration: {e}")

    mysql.connection.commit()
    cursor.close()
    print("Location Database migration complete.")
