import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Techpro16MAX#",
        database="flask_database"
    )
    cursor = conn.cursor()
    cursor.execute("DESCRIBE users")
    for row in cursor.fetchall():
        print(row)
except Exception as e:
    print(f"Error: {e}")
