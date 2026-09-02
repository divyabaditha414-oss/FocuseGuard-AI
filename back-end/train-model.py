import requests
import pandas as pd
from sklearn import pipeline
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
import joblib
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)
# -----------------------------------
# 1. Fetch data from FastAPI
# -----------------------------------
API_URL = "http://127.0.0.1:8000/app-usage"
response = requests.get(API_URL)
if response.status_code != 200:
    print("Error fetching data from API")
    print("Status code:", response.status_code)
    exit()
api_data = response.json()
# Convert API response to DataFrame
df = pd.DataFrame(api_data["data"])
print("Data fetched successfully!")
print("Total records:", len(df))
print("\nColumns available:")
print(df.columns.tolist())
# ----------------------------------
# 2. Check target column
# -----------------------------------
if "productivity" not in df.columns:
    print("ERROR: productivity column not found!")
    exit()
print("\nProductivity values:")
print(df["productivity"].value_counts())
# -----------------------------------
# 3. Select input features
# -----------------------------------
features = [
    "duration_minutes",
    "switch_count",
    "switches",
    "app_name",
    "website",
    "user_type",
    "browser",
    "device_type",
    "category",
    "focus_level",
    "session_type"
]
# Keep only columns that actually exist
features = [column for column in features if column in df.columns]

X = df[features]
y = df["productivity"]
# -----------------------------------
# 4. Remove missing values
# -----------------------------------
data = pd.concat([X, y], axis=1)
# No switch is valid information
if "switches" in data.columns:
    data["switches"] = data["switches"].fillna("No Switch")
data = data.dropna()
X = data[features]
y = data["productivity"]


# -----------------------------------
# 5. Identify categorical/numerical
# -----------------------------------

categorical_features = X.select_dtypes(
    include=["object"]
).columns.tolist()

numerical_features = X.select_dtypes(
    exclude=["object"]
).columns.tolist()


print("\nNumerical features:")
print(numerical_features)

print("\nCategorical features:")
print(categorical_features)


# -----------------------------------
# 6. Convert categorical data
# -----------------------------------

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            categorical_features
        )
    ],
    remainder="passthrough"
)


# -----------------------------------
# 7. Split 70% Train / 30% Test
# -----------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.30,
    random_state=42,
    stratify=y
)

print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))


# -----------------------------------
# 8. Decision Tree Model
# -----------------------------------

decision_tree = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        (
            "model",
            DecisionTreeClassifier(
                random_state=42
            )
        )
    ]
)


decision_tree.fit(X_train, y_train)
joblib.dump(decision_tree, "productivity_model.joblib")

print("Decision Tree model saved successfully!")

dt_prediction = decision_tree.predict(X_test)


# -----------------------------------
# 9. Random Forest Model
# -----------------------------------

random_forest = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        (
            "model",
            RandomForestClassifier(
                n_estimators=100,
                random_state=42
            )
        )
    ]
)


random_forest.fit(X_train, y_train)
joblib.dump(random_forest, "productivity_model_rf.joblib")

print("Random Forest model saved successfully!")

rf_prediction = random_forest.predict(X_test)


# ----------------------------------------
# Feature Importance
# ----------------------------------------

dt_model = decision_tree.named_steps["model"]

feature_names = (
    decision_tree
    .named_steps["preprocessor"]
    .get_feature_names_out()
)

importance = dt_model.feature_importances_

feature_importance = pd.DataFrame({
    "feature": feature_names,
    "importance": importance
})

feature_importance = feature_importance.sort_values(
    by="importance",
    ascending=False
)

print("\nDecision Tree Feature Importance:")
print(feature_importance)


# -----------------------------------
# 10. Evaluate Decision Tree
# -----------------------------------

dt_accuracy = accuracy_score(
    y_test,
    dt_prediction
)

dt_precision = precision_score(
    y_test,
    dt_prediction,
    average="weighted",
    zero_division=0
)

dt_recall = recall_score(
    y_test,
    dt_prediction,
    average="weighted",
    zero_division=0
)

dt_f1 = f1_score(
    y_test,
    dt_prediction,
    average="weighted",
    zero_division=0
)


# ----------------------------------------
# 12. Feature Importance
# ----------------------------------------

dt_model = decision_tree.named_steps["model"]

feature_names = decision_tree.named_steps["preprocessor"].get_feature_names_out()

importance = dt_model.feature_importances_

feature_importance = pd.DataFrame({
    "feature": feature_names,
    "importance": importance
})

feature_importance = feature_importance.sort_values(
    by="importance",
    ascending=False
)

print("\nDecision Tree Feature Importance:")
print(feature_importance)

# -----------------------------------
# 11. Evaluate Random Forest
# -----------------------------------

rf_accuracy = accuracy_score(
    y_test,
    rf_prediction
)

rf_precision = precision_score(
    y_test,
    rf_prediction,
    average="weighted",
    zero_division=0
)

rf_recall = recall_score(
    y_test,
    rf_prediction,
    average="weighted",
    zero_division=0
)

rf_f1 = f1_score(
    y_test,
    rf_prediction,
    average="weighted",
    zero_division=0
)


# -----------------------------------
# 12. Display Results
# -----------------------------------

print("\n====================================")
print("        MODEL COMPARISON")
print("====================================")

print("\nDecision Tree:")
print("Accuracy :", round(dt_accuracy, 4))
print("Precision:", round(dt_precision, 4))
print("Recall   :", round(dt_recall, 4))
print("F1 Score :", round(dt_f1, 4))


print("\nRandom Forest:")
print("Accuracy :", round(rf_accuracy, 4))
print("Precision:", round(rf_precision, 4))
print("Recall   :", round(rf_recall, 4))
print("F1 Score :", round(rf_f1, 4))


# -----------------------------------
# 13. Choose the best model
# -----------------------------------

if rf_f1 > dt_f1:
    print("\nBEST MODEL: Random Forest")
else:
    print("\nBEST MODEL: Decision Tree")

    preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        )
    ],
    remainder="passthrough"
)

    dt_pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", DecisionTreeClassifier(random_state=42))
    ]
)
dt_pipeline.fit(X_train, y_train)
dt_prediction = dt_pipeline.predict(X_test)
print("Decision Tree trained successfully!")
print("\nTarget distribution:")
print(df["productivity"].value_counts())
print("\nTraining target distribution:")
print(y_train.value_counts())
print("\nTesting target distribution:")
print(y_test.value_counts())
print("\nWebsite vs Productivity:")
print(pd.crosstab(df["website"], df["productivity"]))
print("\nSwitches vs Productivity:")
print(pd.crosstab(df["switches"], df["productivity"]))