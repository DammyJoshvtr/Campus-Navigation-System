from app import app, mysql

with app.app_context():
    cursor = mysql.connection.cursor()
    try:
        # This will safely make the most recently created account an admin
        cursor.execute("UPDATE users SET role = 'admin' ORDER BY id DESC LIMIT 1")
        mysql.connection.commit()
        
        # Verify who is admin now
        cursor.execute("SELECT id, name, email FROM users WHERE role = 'admin'")
        admins = cursor.fetchall()
        print("\n--- Current Admin Accounts ---")
        for admin in admins:
            print(f"ID: {admin[0]} | Name: {admin[1]} | Email: {admin[2]}")
        print("------------------------------\n")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cursor.close()
