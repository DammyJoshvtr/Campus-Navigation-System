from app import app, mysql

with app.app_context():
    cursor = mysql.connection.cursor()
    try:
        print("Disabling foreign key checks...")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        
        print("Truncating saved_directions...")
        cursor.execute("TRUNCATE TABLE saved_directions")
        
        print("Truncating users...")
        cursor.execute("TRUNCATE TABLE users")
        
        print("Enabling foreign key checks...")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        
        mysql.connection.commit()
        print("\nSUCCESS! The database has been completely wiped and IDs are reset to 1.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cursor.close()
