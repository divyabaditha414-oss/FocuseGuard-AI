from os import name

from fastapi import FastAPI, HTTPException, Depends
import pandas as pd
import joblib
from pathlib import Path
import sqlalchemy
from datetime import datetime, timedelta
MODEL_PATH = Path(__file__).parent / "productivity_model.joblib"
productivity_model = joblib.load(MODEL_PATH)
print("Productivity model loaded successfully!")
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import SessionLocal, engine
from models import User
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
from models import Base, User, AppUsageLog, FocusSession
app = FastAPI()

# -----------------------------------------------------------------------
# DEMO DATA HELPER
# -----------------------------------------------------------------------
# The mock dataset was generated only for user_ids 1, 2, and 3.
# Any user who logs in but has no AppUsageLog rows will receive the same
# demo analytics as user_id 1 (the primary demo dataset).
# Profile / account data always stays per-user — only analytics fall back.
# -----------------------------------------------------------------------

DEMO_USER_ID = 1  # primary demo dataset


def get_analytics_user_id(user_id: int, db) -> int:
    """
    Return user_id if that user has app-usage data in the database,
    otherwise fall back to DEMO_USER_ID so every logged-in user sees
    the same demo analytics.
    """
    has_data = (
        db.query(AppUsageLog.id)
        .filter(AppUsageLog.user_id == user_id)
        .first()
    )
    return user_id if has_data else DEMO_USER_ID


def get_session_user_id(user_id: int, db) -> int:
    """
    Return user_id if that user has any FocusSession rows,
    otherwise fall back to DEMO_USER_ID so new users see demo
    session history instead of an empty list.
    The /active and /start /end endpoints are NOT affected —
    those always operate on the real user_id.
    """
    has_sessions = (
        db.query(FocusSession.id)
        .filter(FocusSession.user_id == user_id)
        .first()
    )
    return user_id if has_sessions else DEMO_USER_ID


from sqlalchemy import func
from datetime import date
from models import (
    Base,
    User,
    AppUsageLog,
    FocusSession
)
class FocusSessionStart(BaseModel):
    user_id: int
    target_minutes: int = 25
# Create tables if they don't exist
Base.metadata.create_all(bind=engine)
# CORS
# CORs
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://focuse-guard-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------
# Request Models
# -----------------------------

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class LoginData(BaseModel):
    username_or_email: str
    password: str


class WebsiteTrack(BaseModel):
    user_id: int
    website: str
    switch_count: int


# -----------------------------
# Home
# -----------------------------

@app.get("/")
def home():
    return {"message": "FastAPI Backend is Running"}


# -----------------------------
# Register
# -----------------------------

@app.post("/register")
def register(user: UserCreate):

    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        db.close()
        return {"message": "Email already registered"}

    new_user = User(
        username=user.username,
        email=user.email,
        password=user.password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    db.close()

    return {"message": "Registration Successful"}


# -----------------------------
# Login
# -----------------------------

@app.post("/login")
def login(user: LoginData):

    print(user.username_or_email)
    print(user.password)

    db = SessionLocal()

    existing_user = db.query(User).filter(
        or_(
            User.username == user.username_or_email,
            User.email == user.username_or_email
        ),
        User.password == user.password
    ).first()

    db.close()

    if existing_user:
        return {
            "message": "Login Successful",
            "user_id": existing_user.id
        }

    return {
        "message": "Invalid Username/Email or Password"
    }
# -----------------------------
# Track Website
# -----------------------------

@app.post("/track")
def track(data: WebsiteTrack):

    db = SessionLocal()

    log = AppUsageLog(
        user_id=data.user_id,
        website=data.website,
        switch_count=data.switch_count
    )

    db.add(log)
    db.commit()
    db.close()

    return {"message": "Saved"}


# -----------------------------
# Get App Usage
# -----------------------------

@app.get("/app-usage")
def get_app_usage():

    db = SessionLocal()

    data = db.query(AppUsageLog).all()

    result = []

    for row in data:
     result.append({
        "id": row.id,
        "user_id": row.user_id,
        "website": row.website,
        "switch_count": row.switch_count,
        "switches": row.switches,
        "created_at": row.created_at,
        "productivity": row.productivity
    })

    db.close()

    return {
        "total_records": len(result),
        "data": result
    }


def get_date_range(period: str):
    # Latest mock-data date
    reference_date = datetime(2026, 8, 29)

    if period == "today":
        start_date = reference_date.replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        end_date = reference_date.replace(
            hour=23, minute=59, second=59, microsecond=999999
        )

    elif period == "week":
        start_date = reference_date - timedelta(days=6)
        start_date = start_date.replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        end_date = reference_date.replace(
            hour=23, minute=59, second=59, microsecond=999999
        )

    elif period == "month":
        start_date = reference_date.replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        end_date = reference_date.replace(
            hour=23, minute=59, second=59, microsecond=999999
        )

    else:
        start_date = None
        end_date = None

    return start_date, end_date
from pydantic import BaseModel


class ProductivityInput(BaseModel):
    website: str
    switch_count: int
    switches: str
@app.post("/predict-productivity")
def predict_productivity(data: ProductivityInput):

    input_data = pd.DataFrame([{
        "website": data.website,
        "switch_count": data.switch_count,
        "switches": data.switches
    }])

    prediction = productivity_model.predict(input_data)[0]

    return {
        "website": data.website,
        "switch_count": data.switch_count,
        "switches": data.switches,
        "productivity": prediction
    }

@app.get("/focus-score/{user_id}")
def get_focus_score(user_id: int ,  period: str = "today"):

    db = SessionLocal()
    start_date, end_date = get_date_range(period)
    analytics_uid = get_analytics_user_id(user_id, db)

    try:
       query = db.query(AppUsageLog).filter(
    AppUsageLog.user_id == analytics_uid
)

       if start_date and end_date:
        query = query.filter(
        AppUsageLog.created_at >= start_date,
        AppUsageLog.created_at <= end_date
    )

        records = query.all()

        if not records:
            return {
                "user_id": user_id,
                "total_minutes": 0,
                "productive_minutes": 0,
                "focus_score": 0
            }

        total_minutes = sum(
            record.duration_minutes or 0
            for record in records
        )

        productive_minutes = sum(
            record.duration_minutes or 0
            for record in records
            if record.productivity == "Productive"
        )

        if total_minutes > 0:
            focus_score = (productive_minutes / total_minutes) * 100
        else:
            focus_score = 0

        return {
            "user_id": user_id,
            "total_minutes": total_minutes,
            "productive_minutes": productive_minutes,
            "focus_score": round(focus_score, 2)
        }

    finally:
        db.close()
# -----------------------------
# Screen Time
# -----------------------------
@app.get("/screen-time/{user_id}")
def get_screen_time(user_id: int, period: str = "today"):

    db = SessionLocal()

    try:
        start_date, end_date = get_date_range(period)
        analytics_uid = get_analytics_user_id(user_id, db)

        query = db.query(AppUsageLog).filter(
            AppUsageLog.user_id == analytics_uid
        )

        if start_date and end_date:
            query = query.filter(
                AppUsageLog.created_at >= start_date,
                AppUsageLog.created_at <= end_date
            )

        records = query.all()

        total_minutes = sum(
            record.duration_minutes or 0
            for record in records
        )

        hours = total_minutes // 60
        minutes = total_minutes % 60

        return {
            "user_id": user_id,
            "period": period,
            "total_minutes": total_minutes,
            "hours": hours,
            "minutes": minutes
        }

    finally:
        db.close()
# -----------------------------
# Distraction Analysis
# -----------------------------

@app.get("/distraction-analysis/{user_id}")
def get_distraction_analysis(user_id: int, period: str = "today"):

    db = SessionLocal()

    try:
        start_date, end_date = get_date_range(period)
        analytics_uid = get_analytics_user_id(user_id, db)

        query = db.query(AppUsageLog).filter(
            AppUsageLog.user_id == analytics_uid
        )

        if start_date and end_date:
            query = query.filter(
                AppUsageLog.created_at >= start_date,
                AppUsageLog.created_at <= end_date
            )

        records = query.all()

        productive = []
        non_productive = []

        for record in records:

            activity = {
                "website": record.website,
                "duration_minutes": record.duration_minutes or 0,
                "switch_count": record.switch_count or 0
            }

            if record.productivity == "Productive":
                productive.append(activity)
            else:
                non_productive.append(activity)

        return {
            "user_id": user_id,
            "period": period,
            "total_activities": len(records),
            "productive_count": len(productive),
            "non_productive_count": len(non_productive),
            "distraction_count": len(non_productive),
            "productive": productive,
            "non_productive": non_productive
        }

    finally:
        db.close()

      # -----------------------------
# Task Switch Details
# -----------------------------

@app.get("/task-switches/{user_id}")
def get_task_switches(
    user_id: int,
    period: str = "today"
):

    db = SessionLocal()

    try:

        # --------------------------------
        # DATE RANGE
        # --------------------------------

        start_date, end_date = get_date_range(period)
        analytics_uid = get_analytics_user_id(user_id, db)

        query = (
            db.query(AppUsageLog)
            .filter(
                AppUsageLog.user_id == analytics_uid
            )
        )

        if start_date and end_date:

            query = query.filter(
                AppUsageLog.created_at >= start_date,
                AppUsageLog.created_at <= end_date
            )

        # IMPORTANT:
        # Oldest → newest
        records = (
            query
            .order_by(
                AppUsageLog.created_at.asc()
            )
            .all()
        )

        # --------------------------------
        # TOTAL SWITCHES
        # --------------------------------

        total_switches = sum(
            record.switch_count or 0
            for record in records
        )

        # --------------------------------
        # SWITCH DETAILS
        # --------------------------------

        switch_details = []

        for i in range(1, len(records)):

            previous = records[i - 1]
            current = records[i]

            from_app = previous.website or "Unknown"
            to_app = current.website or "Unknown"

            # Ignore same application
            if from_app == to_app:
                continue

            switch_details.append({

                "id": len(switch_details) + 1,

                "from_app": from_app,

                "to_app": to_app,

                "time": (
                    current.created_at.strftime("%H:%M")
                    if current.created_at
                    else ""
                ),

                "date": (
                    current.created_at.strftime("%Y-%m-%d")
                    if current.created_at
                    else ""
                ),

                "duration_minutes": (
                    current.duration_minutes or 0
                ),

                "productivity": (
                    current.productivity or "Unknown"
                )

            })

        # --------------------------------
        # RESPONSE
        # --------------------------------

        return {

            "user_id": user_id,

            "period": period,

            "total_switches": total_switches,

            "detected_transitions": len(
                switch_details
            ),

            "switch_details": switch_details

        }

    except Exception as e:

        print(
            "Task Switch Error:",
            str(e)
        )

        return {
            "error": str(e)
        }

    finally:

        db.close() 
# -----------------------------
# Get User Profile
# -----------------------------

@app.get("/user/{user_id}")
def get_user(user_id: int):

    db = SessionLocal()

    try:
        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            return {
                "message": "User not found"
            }

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }

    finally:
        db.close()

@app.get("/period-test/{user_id}")
def period_test(user_id: int, period: str = "today"):

    db = SessionLocal()

    try:
        start_date, end_date = get_date_range(period)
        analytics_uid = get_analytics_user_id(user_id, db)

        query = db.query(AppUsageLog).filter(
            AppUsageLog.user_id == analytics_uid
        )

        if start_date and end_date:
            query = query.filter(
                AppUsageLog.created_at >= start_date,
                AppUsageLog.created_at <= end_date
            )

        records = query.all()

        return {
            "user_id": user_id,
            "period": period,
            "start_date": start_date,
            "end_date": end_date,
            "record_count": len(records)
        }

    finally:
        db.close()
@app.post("/focus-sessions/start")
def start_focus_session(data: FocusSessionStart):

    db = SessionLocal()

    try:

        # Check whether user already has an active session
        active_session = (
            db.query(FocusSession)
            .filter(
                FocusSession.user_id == data.user_id,
                FocusSession.status == "active"
            )
            .first()
        )

        if active_session:
            return {
                "message": "A focus session is already active",
                "session_id": active_session.id,
                "start_time": active_session.start_time,
                "target_minutes": active_session.target_minutes
            }

        session = FocusSession(
            user_id=data.user_id,
            start_time=datetime.utcnow(),
            target_minutes=data.target_minutes,
            duration_minutes=0,
            status="active"
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        return {
            "message": "Focus session started",
            "session_id": session.id,
            "start_time": session.start_time,
            "target_minutes": session.target_minutes,
            "status": session.status
        }

    finally:
        db.close()

@app.post("/focus-sessions/{session_id}/end")
def end_focus_session(session_id: int):

    db = SessionLocal()

    try:

        session = (
            db.query(FocusSession)
            .filter(FocusSession.id == session_id)
            .first()
        )

        if not session:
            return {
                "error": "Focus session not found"
            }

        if session.status == "completed":
            return {
                "message": "Session already completed"
            }

        end_time = datetime.utcnow()

        duration = (
            end_time - session.start_time
        ).total_seconds() / 60

        duration_minutes = max(
            1,
            round(duration)
        )

        session.end_time = end_time

        session.duration_minutes = duration_minutes

        session.status = "completed"

        db.commit()
        db.refresh(session)

        return {
            "message": "Focus session completed",
            "session_id": session.id,
            "duration_minutes": session.duration_minutes,
            "start_time": session.start_time,
            "end_time": session.end_time,
            "status": session.status
        }

    finally:
        db.close()
@app.get("/focus-sessions/{user_id}")
def get_focus_sessions(
    user_id: int,
    period: str = "today"
):

    db = SessionLocal()

    try:

        # --------------------------------------------------
        # Resolve demo fallback: if this user has no real
        # FocusSession rows, serve user_id=1's demo sessions.
        # The /active, /start and /end endpoints are not
        # affected — they always use the real user_id.
        # --------------------------------------------------
        session_uid = get_session_user_id(user_id, db)

        # --------------------------------------------------
        # DATE ANCHOR
        # When serving the demo dataset (session_uid != user_id)
        # we must anchor to the demo data's reference date
        # (2026-06-30) rather than utcnow(), otherwise the
        # date window never overlaps the mock records and the
        # list comes back empty.
        # --------------------------------------------------
        if session_uid != user_id:
            # Demo fallback — find the latest session date for
            # the demo user and use that as the reference point.
            latest_demo = (
                db.query(FocusSession)
                .filter(FocusSession.user_id == session_uid)
                .order_by(FocusSession.start_time.desc())
                .first()
            )
            if latest_demo and latest_demo.start_time:
                now = latest_demo.start_time
            else:
                # Absolute fallback: use the known mock-data date
                now = datetime(2026, 6, 30, 23, 59, 59)
        else:
            now = datetime.utcnow()

        if period == "today":
            start_date = datetime(
                now.year,
                now.month,
                now.day
            )

        elif period == "week":
            start_date = now - timedelta(days=7)

        elif period == "month":
            start_date = now - timedelta(days=30)

        else:
            start_date = datetime(
                now.year,
                now.month,
                now.day
            )

        sessions = (
            db.query(FocusSession)
            .filter(
                FocusSession.user_id == session_uid,
                FocusSession.start_time >= start_date
            )
            .order_by(
                FocusSession.start_time.desc()
            )
            .all()
        )

        return [
            {
                "id": session.id,
                "start_time": session.start_time,
                "end_time": session.end_time,
                "duration_minutes": session.duration_minutes,
                "target_minutes": session.target_minutes,
                "status": session.status
            }
            for session in sessions
        ]

    finally:
        db.close()

@app.get("/focus-sessions/{user_id}/active")
def get_active_focus_session(user_id: int):

    db = SessionLocal()

    try:

        session = (
            db.query(FocusSession)
            .filter(
                FocusSession.user_id == user_id,
                FocusSession.status == "active"
            )
            .first()
        )

        if not session:
            return {
                "active": False
            }

        return {
            "active": True,
            "session_id": session.id,
            "start_time": session.start_time,
            "target_minutes": session.target_minutes,
            "status": session.status
        }

    finally:
        db.close()

@app.get("/activity-monitor/{user_id}")
def get_activity_monitor(
    user_id: int,
    period: str = "today"
):
    db = SessionLocal()

    try:

        # ==========================================
        # 1. CHECK USER
        # ==========================================

        user = (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )


        # ==========================================
        # 2. FIND LATEST AVAILABLE APP DATA
        # ==========================================

        analytics_uid = get_analytics_user_id(user_id, db)

        latest_record = (
            db.query(AppUsageLog)
            .filter(
                AppUsageLog.user_id == analytics_uid
            )
            .order_by(
                AppUsageLog.created_at.desc()
            )
            .first()
        )

        if not latest_record:

            return {
                "user_id": user_id,
                "period": period,
                "reference_date": None,
                "total_screen_time": 0,
                "active_apps": 0,
                "total_switches": 0,
                "productive_minutes": 0,
                "non_productive_minutes": 0,
                "activities": []
            }


        # ==========================================
        # 3. USE LATEST DATABASE DATE
        # ==========================================

        reference_date = latest_record.created_at

        reference_day = reference_date.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        )


        # ==========================================
        # 4. CALCULATE PERIOD
        # ==========================================

        if period == "today":

            start_date = reference_day

            end_date = (
                reference_day
                + timedelta(days=1)
            )


        elif period == "week":

            end_date = (
                reference_day
                + timedelta(days=1)
            )

            start_date = (
                end_date
                - timedelta(days=7)
            )


        elif period == "month":

            end_date = (
                reference_day
                + timedelta(days=1)
            )

            start_date = (
                end_date
                - timedelta(days=30)
            )


        else:

            raise HTTPException(
                status_code=400,
                detail="period must be today, week or month"
            )


        # ==========================================
        # 5. GET APP USAGE DATA
        # ==========================================

        logs = (
            db.query(AppUsageLog)
            .filter(
                AppUsageLog.user_id == analytics_uid,
                AppUsageLog.created_at >= start_date,
                AppUsageLog.created_at < end_date
            )
            .order_by(
                AppUsageLog.created_at.asc()
            )
            .all()
        )


        # ==========================================
        # 6. CALCULATE SCREEN TIME
        # ==========================================

        total_screen_time = sum(
            log.duration_minutes or 0
            for log in logs
        )


        # ==========================================
        # 7. CALCULATE APP SWITCHES
        # ==========================================

        total_switches = sum(
            log.switch_count or 0
            for log in logs
        )


        # ==========================================
        # 8. CALCULATE PRODUCTIVITY
        # ==========================================

        productive_minutes = sum(
            log.duration_minutes or 0
            for log in logs
            if str(log.productivity).strip().lower()
            == "productive"
        )


        non_productive_minutes = sum(
            log.duration_minutes or 0
            for log in logs
            if str(log.productivity).strip().lower()
            == "non-productive"
        )


        # ==========================================
        # 9. FIND UNIQUE APPS
        # ==========================================

        unique_apps = set()

        for log in logs:

            if log.website:
                unique_apps.add(
                    log.website
                )


        # ==========================================
        # 10. ACTIVITY DETAILS
        # ==========================================

        activities = []

        for log in logs:

            activities.append({

                "id": log.id,

                "website": log.website,

                "duration_minutes":
                    log.duration_minutes or 0,

                "switch_count":
                    log.switch_count or 0,

                "productivity":
                    log.productivity,

                "created_at":
                    (
                        log.created_at.isoformat()
                        if log.created_at
                        else None
                    )
            })


        # ==========================================
        # 11. RETURN RESPONSE
        # ==========================================

        return {

            "user_id": user_id,

            "period": period,

            "reference_date":
                reference_date.isoformat(),

            "start_date":
                start_date.isoformat(),

            "end_date":
                end_date.isoformat(),

            "total_screen_time":
                total_screen_time,

            "active_apps":
                len(unique_apps),

            "total_switches":
                total_switches,

            "productive_minutes":
                productive_minutes,

            "non_productive_minutes":
                non_productive_minutes,

            "activities":
                activities
        }


    finally:

        db.close()
@app.get("/distraction-count/{user_id}")
def distraction_count(
    user_id: int,
    period: str = "today"
):
    db = SessionLocal()

    try:
        # -------------------------------------------------
        # FIND LATEST DATE AVAILABLE FOR THIS USER
        # (fall back to demo dataset if user has no data)
        # -------------------------------------------------
        analytics_uid = get_analytics_user_id(user_id, db)

        latest_record = (
            db.query(AppUsageLog)
            .filter(
                AppUsageLog.user_id == analytics_uid
            )
            .order_by(
                AppUsageLog.created_at.desc()
            )
            .first()
        )

        # No data for user
        if not latest_record:
            return {
                "user_id": user_id,
                "period": period,
                "distraction_count": 0,
                "distraction_minutes": 0,
                "distraction_switches": 0,
                "distracting_websites": []
            }

        # Latest mock-data date becomes reference date
        reference_date = latest_record.created_at

        # -------------------------------------------------
        # DATE RANGE
        # -------------------------------------------------

        if period == "today":

            start_date = reference_date.replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0
            )

            end_date = reference_date.replace(
                hour=23,
                minute=59,
                second=59,
                microsecond=999999
            )

        elif period == "week":

            start_date = (
                reference_date - timedelta(days=6)
            ).replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0
            )

            end_date = reference_date.replace(
                hour=23,
                minute=59,
                second=59,
                microsecond=999999
            )

        elif period == "month":

            start_date = reference_date.replace(
                day=1,
                hour=0,
                minute=0,
                second=0,
                microsecond=0
            )

            end_date = reference_date.replace(
                hour=23,
                minute=59,
                second=59,
                microsecond=999999
            )

        else:

            start_date = reference_date.replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0
            )

            end_date = reference_date.replace(
                hour=23,
                minute=59,
                second=59,
                microsecond=999999
            )

        # -------------------------------------------------
        # GET NON-PRODUCTIVE ACTIVITIES
        # -------------------------------------------------

        distractions = (
            db.query(AppUsageLog)
            .filter(
                AppUsageLog.user_id == analytics_uid,
                AppUsageLog.created_at >= start_date,
                AppUsageLog.created_at <= end_date,
                AppUsageLog.productivity.ilike("%non%")
            )
            .all()
        )

        # -------------------------------------------------
        # CALCULATE DISTRACTION VALUES
        # -------------------------------------------------

        distraction_count = len(distractions)

        distraction_minutes = sum(
            activity.duration_minutes or 0
            for activity in distractions
        )

        distraction_switches = sum(
            activity.switch_count or 0
            for activity in distractions
        )

        # -------------------------------------------------
        # WEBSITE SUMMARY
        # -------------------------------------------------

        website_data = {}

        for activity in distractions:

            website = (
                activity.website
                or "Unknown"
            )

            if website not in website_data:

                website_data[website] = {
                    "website": website,
                    "duration_minutes": 0,
                    "switch_count": 0,
                    "count": 0
                }

            website_data[website][
                "duration_minutes"
            ] += (
                activity.duration_minutes or 0
            )

            website_data[website][
                "switch_count"
            ] += (
                activity.switch_count or 0
            )

            website_data[website][
                "count"
            ] += 1

        distracting_websites = list(
            website_data.values()
        )

        distracting_websites.sort(
            key=lambda x:
                x["duration_minutes"],
            reverse=True
        )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {
            "user_id": user_id,
            "period": period,

            "reference_date":
                reference_date.strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),

            "start_date":
                start_date.strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),

            "end_date":
                end_date.strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),

            "distraction_count":
                distraction_count,

            "distraction_minutes":
                distraction_minutes,

            "distraction_switches":
                distraction_switches,

            "distracting_websites":
                distracting_websites
        }

    except Exception as e:

        print(
            "Distraction Count Error:",
            str(e)
        )

        return {
            "error": str(e)
        }

    finally:
        db.close()


# ============================================================
# ANALYTICS
# ============================================================

@app.get("/analytics/{user_id}")
def get_analytics(
    user_id: int,
    period: str = "today"
):
    db = SessionLocal()

    try:

        # ====================================================
        # 1. RESOLVE DEMO FALLBACK
        #    If the requesting user has no usage data, serve
        #    user_id=1's demo dataset instead.
        # ====================================================

        analytics_uid = get_analytics_user_id(user_id, db)

        # ====================================================
        # 2. FIND LATEST DATE AVAILABLE IN DATABASE
        # ====================================================

        latest_record = (
            db.query(AppUsageLog.created_at)
            .filter(
                AppUsageLog.user_id == analytics_uid
            )
            .order_by(
                AppUsageLog.created_at.desc()
            )
            .first()
        )

        # No data for this user
        if not latest_record or not latest_record[0]:
            return {
                "user_id": user_id,
                "period": period,
                "summary": {
                    "focus_score": 0,
                    "screen_time": 0,
                    "productive_time": 0,
                    "non_productive_time": 0,
                    "app_switches": 0,
                    "distractions": 0,
                    "focus_sessions": 0,
                    "active_apps": 0
                },
                "productivity": {
                    "productive_minutes": 0,
                    "non_productive_minutes": 0,
                    "productive_percentage": 0
                },
                "applications": [],
                "focus_trend": [],
                "switch_analysis": [],
                "session_analysis": []
            }

        # Latest mock-data date
        reference_date = latest_record[0]

        # ====================================================
        # 2. CREATE DATE RANGE
        # ====================================================

        reference_date = reference_date.replace(
            hour=23,
            minute=59,
            second=59,
            microsecond=999999
        )

        if period == "today":

            start_date = reference_date.replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0
            )

        elif period == "week":

            start_date = (
                reference_date - timedelta(days=6)
            ).replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0
            )

        elif period == "month":

            start_date = reference_date.replace(
                day=1,
                hour=0,
                minute=0,
                second=0,
                microsecond=0
            )

        else:

            return {
                "detail": "period must be today, week, or month"
            }

        end_date = reference_date

        # ====================================================
        # 3. GET APP USAGE RECORDS
        # ====================================================

        records = (
            db.query(AppUsageLog)
            .filter(
                AppUsageLog.user_id == analytics_uid,
                AppUsageLog.created_at >= start_date,
                AppUsageLog.created_at <= end_date
            )
            .order_by(
                AppUsageLog.created_at.asc()
            )
            .all()
        )

        # ====================================================
        # 4. SCREEN TIME
        # ====================================================

        screen_time = sum(
            int(record.duration_minutes or 0)
            for record in records
        )

        # ====================================================
        # 5. PRODUCTIVE TIME
        # ====================================================

        productive_time = sum(
            int(record.duration_minutes or 0)
            for record in records
            if str(record.productivity).lower()
            == "productive"
        )

        # ====================================================
        # 6. NON-PRODUCTIVE TIME
        # ====================================================

        non_productive_time = max(
            screen_time - productive_time,
            0
        )

        # ====================================================
        # 7. FOCUS SCORE
        # ====================================================

        if screen_time > 0:

            focus_score = (
                productive_time /
                screen_time
            ) * 100

        else:

            focus_score = 0

        focus_score = round(
            focus_score,
            2
        )

        # ====================================================
        # 8. APP SWITCHES
        # ====================================================

        app_switches = sum(
            int(record.switch_count or 0)
            for record in records
        )

        # ====================================================
        # 9. DISTRACTIONS
        # ====================================================

        distractions = 0

        for record in records:

            productivity = str(
                record.productivity or ""
            ).lower()

            if (
                "non" in productivity
                or "distract" in productivity
            ):
                distractions += 1

        # ====================================================
        # 10. ACTIVE APPLICATIONS
        # ====================================================

        application_names = set()

        for record in records:

            if record.website:
                application_names.add(
                    record.website
                )

        active_apps = len(
            application_names
        )

        # ====================================================
        # 11. APPLICATION ANALYSIS
        # ====================================================

        application_data = {}

        for record in records:

            website = (
                record.website
                if record.website
                else "Unknown"
            )

            minutes = int(
                record.duration_minutes or 0
            )

            if website not in application_data:

                application_data[website] = {
                    "website": website,
                    "minutes": 0,
                    "switches": 0,
                    "productivity": str(
                        record.productivity
                        or "Unknown"
                    )
                }

            application_data[website]["minutes"] += (
                minutes
            )

            application_data[website]["switches"] += (
                int(record.switch_count or 0)
            )

        applications = sorted(
            application_data.values(),
            key=lambda x: x["minutes"],
            reverse=True
        )

        # ====================================================
        # 12. PRODUCTIVITY PERCENTAGE
        # ====================================================

        if screen_time > 0:

            productive_percentage = round(
                (
                    productive_time /
                    screen_time
                ) * 100,
                2
            )

        else:

            productive_percentage = 0

        # ====================================================
        # 13. FOCUS SESSION ANALYSIS
        # ====================================================

        # Use session fallback so new users see demo sessions
        # in the analytics summary (same pattern as AppUsageLog)
        analytics_session_uid = get_session_user_id(user_id, db)

        focus_sessions = (
            db.query(FocusSession)
            .filter(
                FocusSession.user_id == analytics_session_uid,
                FocusSession.start_time >= start_date,
                FocusSession.start_time <= end_date
            )
            .order_by(
                FocusSession.start_time.asc()
            )
            .all()
        )

        session_analysis = []

        total_session_minutes = 0

        completed_sessions = 0

        for session in focus_sessions:

            duration = int(
                session.duration_minutes or 0
            )

            target = int(
                session.target_minutes or 25
            )

            total_session_minutes += duration

            if (
                str(session.status).lower()
                == "completed"
            ):
                completed_sessions += 1

            session_analysis.append({
                "id": session.id,
                "start_time": session.start_time,
                "end_time": session.end_time,
                "duration_minutes": duration,
                "target_minutes": target,
                "status": session.status
            })

        # ====================================================
        # 14. DAILY FOCUS TREND
        # ====================================================

        focus_trend = []

        if period == "today":

            # One point for today's available data
            focus_trend.append({
                "date": reference_date.strftime(
                    "%Y-%m-%d"
                ),
                "focus_score": focus_score,
                "screen_time": screen_time,
                "productive_time": productive_time
            })

        else:

            current_date = start_date.date()
            final_date = end_date.date()

            while current_date <= final_date:

                day_start = datetime.combine(
                    current_date,
                    datetime.min.time()
                )

                day_end = datetime.combine(
                    current_date,
                    datetime.max.time()
                )

                day_records = (
                    db.query(AppUsageLog)
                    .filter(
                        AppUsageLog.user_id == analytics_uid,
                        AppUsageLog.created_at >= day_start,
                        AppUsageLog.created_at <= day_end
                    )
                    .all()
                )

                day_screen = sum(
                    int(
                        r.duration_minutes or 0
                    )
                    for r in day_records
                )

                day_productive = sum(
                    int(
                        r.duration_minutes or 0
                    )
                    for r in day_records
                    if str(
                        r.productivity
                    ).lower()
                    == "productive"
                )

                if day_screen > 0:

                    day_focus = round(
                        (
                            day_productive /
                            day_screen
                        ) * 100,
                        2
                    )

                else:

                    day_focus = 0

                focus_trend.append({
                    "date": current_date.strftime(
                        "%Y-%m-%d"
                    ),
                    "focus_score": day_focus,
                    "screen_time": day_screen,
                    "productive_time": day_productive
                })

                current_date += timedelta(days=1)

        # ====================================================
        # 15. SWITCH ANALYSIS
        # ====================================================

        switch_analysis = []

        for record in records:

            switch_count = int(
                record.switch_count or 0
            )

            if switch_count > 0:

                switch_analysis.append({
                    "website": record.website,
                    "switch_count": switch_count,
                    "switches": record.switches,
                    "created_at": record.created_at
                })

        # ====================================================
        # 16. ATTENTION STABILITY
        # ====================================================

        if app_switches <= 10:

            attention_stability = "High"

        elif app_switches <= 25:

            attention_stability = "Moderate"

        else:

            attention_stability = "Low"

        # ====================================================
        # 17. PERFORMANCE STATUS
        # ====================================================

        if focus_score >= 80:

            performance_status = "Excellent"

        elif focus_score >= 60:

            performance_status = "Good"

        elif focus_score >= 40:

            performance_status = "Needs Improvement"

        else:

            performance_status = "Low"

        # ====================================================
        # 18. RETURN COMPLETE ANALYTICS
        # ====================================================

        return {

            "user_id": user_id,

            "period": period,

            "reference_date": reference_date.strftime(
                "%Y-%m-%d"
            ),

            "date_range": {
                "start": start_date.strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "end": end_date.strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
            },

            "summary": {

                "focus_score": focus_score,

                "screen_time": screen_time,

                "productive_time": productive_time,

                "non_productive_time":
                    non_productive_time,

                "app_switches": app_switches,

                "distractions": distractions,

                "focus_sessions":
                    len(focus_sessions),

                "active_apps":
                    active_apps,

                "attention_stability":
                    attention_stability,

                "performance_status":
                    performance_status
            },

            "productivity": {

                "productive_minutes":
                    productive_time,

                "non_productive_minutes":
                    non_productive_time,

                "productive_percentage":
                    productive_percentage
            },

            "applications": applications,

            "focus_trend": focus_trend,

            "switch_analysis": switch_analysis,

            "session_analysis": session_analysis,

            "focus_session_summary": {

                "total_sessions":
                    len(focus_sessions),

                "completed_sessions":
                    completed_sessions,

                "total_minutes":
                    total_session_minutes
            }
        }

    finally:

        db.close()

class ProfileUpdate(BaseModel):
    username: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

@app.get("/profile/{user_id}")
def get_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "account_status": "Active"
    }


@app.put("/profile/{user_id}")
def update_profile(
    user_id: int,
    profile: ProfileUpdate,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    username = profile.username.strip()

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Username cannot be empty"
        )

    # Check whether another user already has this username
    existing_user = (
        db.query(User)
        .filter(
            User.username == username,
            User.id != user_id
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    user.username = username

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "id": user.id,
        "username": user.username,
        "email": user.email
    }


@app.put("/profile/{user_id}/change-password")
def change_password(
    user_id: int,
    data: ChangePasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Check current password
    if user.password != data.current_password:
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    # Check new password
    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must contain at least 8 characters"
        )

    # Confirm password
    if data.new_password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="New passwords do not match"
        )

    # Don't allow same password
    if data.current_password == data.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from current password"
        )

    user.password = data.new_password

    db.commit()

    return {
        "message": "Password changed successfully"
    }

@app.put("/profile/{user_id}/change-password")
def change_password(
    user_id: int,
    request: ChangePasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Check current password
    if user.password != request.current_password:
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    # Validate new password
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters"
        )

    # Don't allow same password
    if request.current_password == request.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from current password"
        )

    # Update password
    user.password = request.new_password

    db.commit()
    db.refresh(user)

    return {
        "message": "Password changed successfully"
    }
# =========================================================
# EXPLORE MY DATA
# Returns the actual raw activity records for one user
# =========================================================

@app.get("/explore-data/{user_id}")
def explore_my_data(
    user_id: int,
    period: str = "all"
):
    db = SessionLocal()

    try:
        analytics_uid = get_analytics_user_id(user_id, db)

        query = (
            db.query(AppUsageLog)
            .filter(AppUsageLog.user_id == analytics_uid)
        )

        # -----------------------------------------
        # DATE FILTER
        # -----------------------------------------

        if period in ["today", "week", "month"]:
            start_date, end_date = get_date_range(period)

            if start_date and end_date:
                query = query.filter(
                    AppUsageLog.created_at >= start_date,
                    AppUsageLog.created_at <= end_date
                )

        # -----------------------------------------
        # LATEST FIRST
        # -----------------------------------------

        records = (
            query
            .order_by(AppUsageLog.created_at.desc())
            .all()
        )

        # -----------------------------------------
        # RETURN RAW DATA
        # -----------------------------------------

        result = []

        for row in records:

            result.append({
                "id": row.id,
                "user_id": row.user_id,
                "website": row.website,
                "switch_count": row.switch_count or 0,
                "switches": row.switches,
                "duration_minutes": row.duration_minutes or 0,
                "productivity": row.productivity,
                "created_at": row.created_at
            })

        return {
            "user_id": user_id,
            "period": period,
            "total_records": len(result),
            "data": result
        }

    except Exception as e:

        print(
            "Explore My Data Error:",
            str(e)
        )

        return {
            "user_id": user_id,
            "period": period,
            "total_records": 0,
            "data": [],
            "error": str(e)
        }

    finally:
        db.close()