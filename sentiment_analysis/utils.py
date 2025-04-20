import sqlite3
import os

def sqlite_lower(value):
    return value.lower()

def sqlite_upper(value):
    return value.upper()

def ignore_case_collation(v1, v2):
    lv1 = v1.lower() if v1 is not None else ""
    lv2 = v2.lower() if v2 is not None else ""
    if lv1 == lv2:
        return 0
    return -1 if lv1 < lv2 else 1

def get_db_connection():
    db_path = os.getenv('DATABASE_PATH', 'db.db')  # Теперь в текущей директории
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.create_collation("NOCASE", ignore_case_collation)
    conn.create_function("LOWER", 1, sqlite_lower)
    conn.create_function("UPPER", 1, sqlite_upper)
    return conn

def init_db():
    conn = get_db_connection()
    # ... (остальная часть функции без изменений) ...
    cur = conn.cursor()

    cur.execute('''
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        tagline TEXT,
        description TEXT,
        reviewsSummary TEXT,
        rating REAL,
        logoUrl TEXT,
        reviewsCount INTEGER
      )
    ''')

    cur.execute('''
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY,
        ozon TEXT,
        instagram TEXT,
        telegram TEXT,
        twitter TEXT,
        wildberries TEXT,
        FOREIGN KEY(id) REFERENCES companies(id)
      )
    ''')

    cur.execute('''
      CREATE TABLE IF NOT EXISTS site_description (
        site TEXT PRIMARY KEY,
        description TEXT
      )
    ''')

    conn.commit()
    conn.close()
