from app import app, mysql

with app.app_context():
    cursor = mysql.connection.cursor()
    try:
        cursor.execute("SELECT id, name, email, is_verified, role FROM users")
        users = cursor.fetchall()
        print("\n--- All Users ---")
        for user in users:
            print(f"ID: {user[0]} | Name: {user[1]} | Email: {user[2]} | Verified: {user[3]} | Role: {user[4]}")
        print("-----------------\n")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cursor.close()
