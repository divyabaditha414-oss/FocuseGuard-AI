from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    email = Column(String)
    password = Column(String)

class AppUsageLog(Base):
    __tablename__ = "app_usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    website = Column(String)
    switch_count = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())