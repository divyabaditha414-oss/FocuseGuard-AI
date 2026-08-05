from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker , declarative_base

DATABASE_URL = "postgresql://postgres:14082005@localhost:5432/focusguard-db"

engine = create_engine(DATABASE_URL)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
Base = declarative_base()
from sqlalchemy import text

try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
        print("✅ PostgreSQL Connected Successfully!")
except Exception as e:
    print("❌ Connection Failed:", e)