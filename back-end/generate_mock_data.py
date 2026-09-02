import random
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:14082005@localhost/focusguard-db"

engine = create_engine(DATABASE_URL)

apps = [
    ("ChatGPT", "chatgpt.com", "AI", "Productive"),
    ("GitHub", "github.com", "Development", "Productive"),
    ("VS Code", "code.visualstudio.com", "IDE", "Productive"),
    ("GeeksforGeeks", "geeksforgeeks.org", "Learning", "Productive"),
    ("LeetCode", "leetcode.com", "Learning", "Productive"),
    ("YouTube", "youtube.com", "Entertainment", "Non-Productive"),
    ("Instagram", "instagram.com", "Social", "Non-Productive"),
    ("Netflix", "netflix.com", "Entertainment", "Non-Productive"),
    ("Facebook", "facebook.com", "Social", "Non-Productive"),
    ("LinkedIn", "linkedin.com", "Professional", "Productive")
]

browsers = ["Chrome", "Edge", "Firefox"]
devices = ["Browser", "Desktop"]
user_types = ["user1", "user2", "user3"]
focus_levels = ["Excellent", "High", "Medium", "Low"]
sessions = ["Study", "Work", "Entertainment", "Break"]

start_time = datetime(2026, 1, 1, 8, 0, 0)

previous_app = "None"
previous_website = "None"

with engine.begin() as conn:

    current_time = start_time

    for i in range(2500):

        user_id = random.randint(1,3)
        user_type = user_types[user_id-1]

        browser = random.choice(browsers)
        device = random.choice(devices)

        app_name, website, category, productivity = random.choice(apps)

        duration = random.randint(5,180)

        opened = current_time
        closed = opened + timedelta(minutes=duration)

        switch_count = random.randint(0,10)

        productivity_score = random.randint(75,100) if productivity=="Productive" else random.randint(10,60)

        focus = random.choice(focus_levels)

        session = random.choice(sessions)

        conn.execute(text("""
        INSERT INTO app_usage_logs(
            user_id,
            user_type,
            app_name,
            website,
            url,
            browser,
            device_type,
            opened_datetime,
            closed_datetime,
            duration_minutes,
            switch_count,
            previous_app,
            previous_website,
            category,
            productivity,
            productivity_score,
            focus_level,
            session_type,
            created_at
        )
        VALUES(
            :user_id,
            :user_type,
            :app_name,
            :website,
            :url,
            :browser,
            :device,
            :opened,
            :closed,
            :duration,
            :switch,
            :previous_app,
            :previous_website,
            :category,
            :productivity,
            :score,
            :focus,
            :session,
            :created
        )
        """),
        {
            "user_id":user_id,
            "user_type":user_type,
            "app_name":app_name,
            "website":website,
            "url":"https://" + website,
            "browser":browser,
            "device":device,
            "opened":opened,
            "closed":closed,
            "duration":duration,
            "switch":switch_count,
            "previous_app":previous_app,
            "previous_website":previous_website,
            "category":category,
            "productivity":productivity,
            "score":productivity_score,
            "focus":focus,
            "session":session,
            "created":opened
        })

        previous_app = app_name
        previous_website = website
        current_time = closed + timedelta(minutes=random.randint(2,20))

print("2500 records inserted successfully!")