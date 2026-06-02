from app import app, mysql

with app.app_context():
    cursor = mysql.connection.cursor()
    
    try:
        # Create audit_logs table
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
            )
        ''')
        mysql.connection.commit()
        print("Created audit_logs table successfully.")
    except Exception as e:
        print(f"Error creating audit_logs table: {e}")
    finally:
        cursor.close()
    
    print("Audit database setup completed.")
