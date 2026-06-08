import MySQLdb

# Remote Railway credentials
DB_HOST = "acela.proxy.rlwy.net"
DB_PORT = 56874
DB_USER = "root"
DB_PASS = "ffyitbUPQyiUlWTaFKXvgeoYqcKPOJja"
DB_NAME = "railway"

def run_migration():
    try:
        print(f"Connecting to remote Railway database {DB_HOST}:{DB_PORT}...")
        conn = MySQLdb.connect(
            host=DB_HOST,
            user=DB_USER,
            passwd=DB_PASS,
            db=DB_NAME,
            port=DB_PORT
        )
        cursor = conn.cursor()
        print("Connected successfully!")
        
        print("Executing ALTER TABLE to add 'floorplan' column...")
        cursor.execute("ALTER TABLE locations ADD COLUMN floorplan LONGTEXT DEFAULT NULL")
        conn.commit()
        print("[✓] Successfully added 'floorplan' column to remote 'locations' table.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[✗] Migration failed: {e}")

if __name__ == "__main__":
    run_migration()
