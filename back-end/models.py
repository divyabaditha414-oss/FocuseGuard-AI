from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from datetime import datetime

from database import Base


# ==========================================
# USER
# ==========================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )


# ==========================================
# APP USAGE LOG
# ==========================================

class AppUsageLog(Base):

    __tablename__ = "app_usage_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    website = Column(
        String,
        nullable=False
    )

    switch_count = Column(
        Integer,
        default=0
    )

    productivity = Column(
        String
    )

    switches = Column(
        String,
        nullable=True
    )

    duration_minutes = Column(
        Integer,
        default=0
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        index=True
    )


# ==========================================
# FOCUS SESSION
# ==========================================

class FocusSession(Base):

    __tablename__ = "focus_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    start_time = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    end_time = Column(
        DateTime,
        nullable=True
    )

    duration_minutes = Column(
        Integer,
        default=0
    )

    target_minutes = Column(
        Integer,
        default=25
    )

    status = Column(
        String,
        default="active"
    )