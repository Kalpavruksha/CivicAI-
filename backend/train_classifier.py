# train_classifier.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib
import os

DATA_PATH = "data/complaints_hdmc.csv"

df = pd.read_csv(DATA_PATH)

df = df.dropna(subset=["ComplaintText", "Category", "Urgency"])

X = df["ComplaintText"]
y_cat = df["Category"]
y_urg = df["Urgency"]

vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
X_vec = vectorizer.fit_transform(X)

cat_model = LogisticRegression(max_iter=2000)
cat_model.fit(X_vec, y_cat)

urg_model = LogisticRegression(max_iter=2000)
urg_model.fit(X_vec, y_urg)

os.makedirs("models", exist_ok=True)

joblib.dump(vectorizer, "models/vectorizer.pkl")
joblib.dump(cat_model, "models/category_model.pkl")
joblib.dump(urg_model, "models/urgency_model.pkl")

print("🎉 Models trained & saved in /models")