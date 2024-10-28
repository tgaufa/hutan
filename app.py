# app.py
from flask import Flask, render_template, jsonify
from app.locations_data import locations
import os
from datetime import date

# Update template directory path
template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app', 'templates')
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app', 'static')

app = Flask(__name__,
           template_folder=template_dir,
           static_folder=static_dir)

@app.route('/')
def index():
    today_date = date.today().isoformat()
    return render_template('index.html', today_date=today_date)

@app.route('/api/locations')
def get_locations():
    return jsonify(locations)

if __name__ == '__main__':
    app.run(debug=True)