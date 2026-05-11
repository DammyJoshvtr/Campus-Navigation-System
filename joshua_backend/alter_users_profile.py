from app import app, mysql

with app.app_context():
    cursor = mysql.connection.cursor()
    try:
        # Add new columns to users table
        cursor.execute("ALTER TABLE users ADD COLUMN student_id VARCHAR(50) DEFAULT ''")
        cursor.execute("ALTER TABLE users ADD COLUMN faculty VARCHAR(100) DEFAULT ''")
        cursor.execute("ALTER TABLE users ADD COLUMN level VARCHAR(50) DEFAULT ''")
        mysql.connection.commit()
        print("Successfully added student_id, faculty, and level columns to users table.")
    except Exception as e:
        print(f"Error adding columns: {e}")
    finally:
        cursor.close()
