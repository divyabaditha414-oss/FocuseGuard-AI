from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, AppUsageLog
from sqlalchemy import or_

app = FastAPI()
Base.metadata.create_all(bind=engine)
app.add_middleware(
    CORSMiddleware,
allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pydantic import BaseModel

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

@app.get("/")
def home():
    return {"message": "FastAPI Backend is Running"}

@app.post("/register")
def register(user: UserCreate):
    db = SessionLocal()

    existing_user = db.query(User).filter(User.email == user.email).first()

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
        return {"message": "Login Successful",
    "user_id": existing_user . id}

    return {"message": "Invalid Username/Email or Password"}


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