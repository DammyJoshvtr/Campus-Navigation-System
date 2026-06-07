import os
import MySQLdb
from MySQLdb.constants import CLIENT

# Database Credentials
DB_HOST = "acela.proxy.rlwy.net"
DB_PORT = 56874
DB_USER = "root"
DB_PASS = "ffyitbUPQyiUlWTaFKXvgeoYqcKPOJja"
DB_NAME = "railway"

# Path to the backup file
BACKUP_FILE_PATH = os.path.join("c:\\", "dev", "Campus-Navigation-System", "xampp_backup.sql")

def import_sql():
    print(f"Connecting to database {DB_HOST}:{DB_PORT}...")
    try:
        # Connect to the remote database enabling multi-statements
        conn = MySQLdb.connect(
            host=DB_HOST,
            user=DB_USER,
            passwd=DB_PASS,
            db=DB_NAME,
            port=DB_PORT,
            client_flag=CLIENT.MULTI_STATEMENTS
        )
        cursor = conn.cursor()
        print("Connected successfully!")

        print(f"Reading SQL backup file from {BACKUP_FILE_PATH}...")
        with open(BACKUP_FILE_PATH, "r", encoding="utf-8") as f:
            sql_script = f.read()

        print("Executing SQL script on Railway database...")
        # Execute the script
        cursor.execute(sql_script)
        
        # Consume all result sets from the multi-statement execution
        print("Consuming database response...")
        while True:
            try:
                cursor.fetchall()
            except:
                pass
            try:
                # next_result returns 0 if there are more results, -1 if no more, or throws if finished
                res = conn.next_result()
                if res == -1 or res is None:
                    break
            except Exception:
                break

        # Commit the changes
        conn.commit()
        print("Database import completed successfully!")
        
        # Verify the import
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print("\nTables imported into Railway:")
        for table in tables:
            print(f"- {table[0]}")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"\n[Error] Database import failed: {e}")

if __name__ == "__main__":
    import_sql()
