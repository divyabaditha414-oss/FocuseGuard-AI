import time
import psycopg2
import win32gui

conn = psycopg2.connect(
    host="localhost",
    database="focusguard-db",
    user="postgres",
    password="14082005"
)

cursor = conn.cursor()

last_app = None
visited = {}
current_switch = {}

while True:

    hwnd = win32gui.GetForegroundWindow()
    app = win32gui.GetWindowText(hwnd)

    if app != last_app:

        if app not in visited:
            visited[app] = True
            current_switch[app] = 0
        else:
            current_switch[app] += 1

        cursor.execute(
            """
            INSERT INTO app_usage_logs(app_name,switch_count)
            VALUES(%s,%s)
            """,
            (app,current_switch[app])
        )

        conn.commit()

        print(app,current_switch[app])

        last_app = app

    time.sleep(1)
    print("Tracker is running...")
    print("Current app:",app)