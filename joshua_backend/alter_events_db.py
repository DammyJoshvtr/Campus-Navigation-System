from app import app, mysql

with app.app_context():
    cursor = mysql.connection.cursor()
    
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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("Created events table.")
    except Exception as e:
        print(f"events table error: {e}")

    mysql.connection.commit()
    cursor.close()
    print("Database alteration complete.")
