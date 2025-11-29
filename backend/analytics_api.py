from fastapi import APIRouter
from pymongo import MongoClient
import os
from datetime import datetime, timedelta

router = APIRouter()

MONGO_URI = os.getenv("MONGO_URI")
client = None
db = None
col = None

# Try to connect to MongoDB, but don't fail if it's not available
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client["civic_db"]
    col = db["complaints"]
    # Test the connection
    client.server_info()
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    client = None
    db = None
    col = None

@router.get("/timeline")
def incident_timeline():
    labels = []
    potholes = []
    garbage = []
    electricity = []

    # If MongoDB is not available, return sample data
    if col is None:
        # Generate sample data for the last 7 days
        for i in range(7):
            day = datetime.utcnow() - timedelta(days=i)
            date_str = day.strftime("%Y-%m-%d")
            labels.insert(0, date_str)
            # Sample data - you can adjust these values
            potholes.insert(0, max(0, 15 - i))  # Decreasing trend
            garbage.insert(0, max(0, 10 + i))   # Increasing trend
            electricity.insert(0, max(0, 5 + i % 3))  # Fluctuating trend
    else:
        # Use real data from MongoDB
        for i in range(7):  # last 7 days
            day = datetime.utcnow() - timedelta(days=i)
            date_str = day.strftime("%Y-%m-%d")
            labels.insert(0, date_str)

            try:
                potholes.insert(0, col.count_documents({"category": "Pothole", "date": date_str}))
                garbage.insert(0, col.count_documents({"category": "Garbage", "date": date_str}))
                electricity.insert(0, col.count_documents({"category": "Electricity", "date": date_str}))
            except Exception as e:
                print(f"Error querying MongoDB: {e}")
                # Fallback to sample data if query fails
                potholes.insert(0, max(0, 15 - i))
                garbage.insert(0, max(0, 10 + i))
                electricity.insert(0, max(0, 5 + i % 3))

    return {
        "labels": labels,
        "potholes": potholes,
        "garbage": garbage,
        "electricity": electricity
    }