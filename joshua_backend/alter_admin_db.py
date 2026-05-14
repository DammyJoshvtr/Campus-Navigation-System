from app import app, mysql

with app.app_context():
    cursor = mysql.connection.cursor()
    
    # Add role to users
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user'")
        print("Added role column to users.")
    except Exception as e:
        print(f"role column might already exist or error: {e}")
        
    # Make sure we have an admin user (for testing)
    # Since only @run.edu.ng emails are allowed to sign up, let's create a default admin or just let the developer set it manually in DB.
    # Actually, we can just insert a default admin or update the first user to be admin
    try:
        cursor.execute("UPDATE users SET role = 'admin' WHERE id = 1")
        print("Set user 1 to admin.")
    except Exception as e:
        print(f"Failed to set admin user: {e}")

    # Add approval_status to events
    try:
        cursor.execute("ALTER TABLE events ADD COLUMN approval_status VARCHAR(50) DEFAULT 'pending'")
        print("Added approval_status column to events.")
    except Exception as e:
        print(f"approval_status column might already exist in events or error: {e}")

    # Ensure status column is present in events just in case
    try:
        cursor.execute("ALTER TABLE events ADD COLUMN status VARCHAR(50) DEFAULT 'upcoming'")
        print("Added status column to events.")
    except Exception as e:
        pass # Probably exists already

    mysql.connection.commit()
    cursor.close()
    print("Admin Database alteration complete.")
