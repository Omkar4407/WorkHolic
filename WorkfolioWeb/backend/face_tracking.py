import os
import datetime
import numpy as np
from PIL import Image
import face_recognition
from openpyxl import load_workbook
from data_logger import log_login, log_break, log_resume, log_logoff

def process_frame(data, image):
    emp_id = data.get('employeeId')
    img_dir = os.path.join(os.path.dirname(__file__), '../public/images')
    reg_img_path = os.path.join(img_dir, f'{emp_id}.jpg')
    if not os.path.exists(reg_img_path):
        return {'match': False, 'message': 'User image not found.'}
    # Load registered face
    reg_img = face_recognition.load_image_file(reg_img_path)
    reg_encodings = face_recognition.face_encodings(reg_img)
    if not reg_encodings:
        return {'match': False, 'message': 'No face in registered image.'}
    reg_encoding = reg_encodings[0]
    # Load frame
    frame = Image.open(image)
    frame = frame.convert('RGB')
    frame_np = np.array(frame)
    frame_encodings = face_recognition.face_encodings(frame_np)
    if not frame_encodings:
        return {'match': False, 'message': 'No face detected.'}
    match = face_recognition.compare_faces([reg_encoding], frame_encodings[0])[0]
    if match:
        log_login(emp_id)
    return {'match': match}

def end_session(data):
    emp_id = data.get('employeeId')
    log_logoff(emp_id)
    return {'success': True}
