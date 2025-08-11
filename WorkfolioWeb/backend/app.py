import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from face_registration import register_user
from face_tracking import process_frame, end_session
from data_logger import get_registered_users, ensure_excel_file

app = Flask(__name__)
CORS(app)

# Ensure Excel file and image directory exist
ensure_excel_file()
if not os.path.exists(os.path.join(os.path.dirname(__file__), '../public/images')):
    os.makedirs(os.path.join(os.path.dirname(__file__), '../public/images'))

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.form
    image = request.files.get('image')
    result = register_user(data, image)
    return jsonify(result)

@app.route('/api/process_frame', methods=['POST'])
def api_process_frame():
    data = request.form
    image = request.files.get('frame')
    result = process_frame(data, image)
    return jsonify(result)

@app.route('/api/end_session', methods=['POST'])
def api_end_session():
    data = request.json
    result = end_session(data)
    return jsonify(result)

@app.route('/api/users', methods=['GET'])
def api_users():
    users = get_registered_users()
    return jsonify(users)

@app.route('/public/images/<filename>')
def serve_image(filename):
    img_dir = os.path.join(os.path.dirname(__file__), '../public/images')
    return send_from_directory(img_dir, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
