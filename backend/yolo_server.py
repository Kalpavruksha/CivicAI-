import os
import base64
import requests
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from io import BytesIO
from PIL import Image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
PROJECT = "civic-issue"
WORKSPACE = "beshu"
VERSION = 1   # your Roboflow version

YOLO_URL = (
    f"https://detect.roboflow.com/{PROJECT}/{VERSION}"
    f"?api_key={ROBOFLOW_API_KEY}&format=json"
)

RENDER_URL = (
    f"https://detect.roboflow.com/{PROJECT}/{VERSION}"
    f"?api_key={ROBOFLOW_API_KEY}&format=image&confidence=0.4"
)

class DetectionResponse(BaseModel):
    detections: list
    rendered_image: str | None  # base64
    width: int
    height: int


@app.post("/yolo", response_model=DetectionResponse)
async def detect_image(file: UploadFile = File(...)):
    image_bytes = await file.read()

    # 1. JSON Detection
    json_resp = requests.post(YOLO_URL, files={"file": image_bytes})
    detections_json = json_resp.json().get("predictions", [])

    # 2. Rendered fallback (Roboflow rendered boxes)
    render_resp = requests.post(RENDER_URL, files={"file": image_bytes})
    b64_img = base64.b64encode(render_resp.content).decode()

    # Get image dimensions (for canvas scaling)
    img = Image.open(BytesIO(image_bytes))
    w, h = img.size

    return DetectionResponse(
        detections=detections_json,
        rendered_image=b64_img,
        width=w,
        height=h
    )