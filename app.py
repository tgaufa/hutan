from flask import Flask, render_template, request, jsonify
from geopy.geocoders import Nominatim  # Fixed import statement
from geopy.distance import geodesic
import folium
import os

app = Flask(__name__)
geocoder = Nominatim(user_agent="web_maps_app")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search_location():
    try:
        data = request.get_json()
        location = data.get('location')
        
        if not location:
            return jsonify({'error': 'Please enter a location'}), 400
            
        location_data = geocoder.geocode(location)
        
        if location_data:
            # Create map
            map_obj = folium.Map(location=[location_data.latitude, location_data.longitude], 
                               zoom_start=13)
            
            # Add marker
            folium.Marker([location_data.latitude, location_data.longitude],
                        popup=location_data.address).add_to(map_obj)
            
            # Ensure the static/maps directory exists
            os.makedirs(os.path.join('static', 'maps'), exist_ok=True)
            
            # Save map
            map_path = os.path.join('static', 'maps', 'search_map.html')
            map_obj.save(map_path)
            
            return jsonify({
                'address': location_data.address,
                'latitude': location_data.latitude,
                'longitude': location_data.longitude,
                'map_path': '/static/maps/search_map.html'
            })
        else:
            return jsonify({'error': 'Location not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/directions', methods=['POST'])
def get_directions():
    try:
        data = request.get_json()
        from_location = data.get('from')
        to_location = data.get('to')
        
        if not from_location or not to_location:
            return jsonify({'error': 'Please enter both locations'}), 400
            
        from_data = geocoder.geocode(from_location)
        to_data = geocoder.geocode(to_location)
        
        if from_data and to_data:
            # Create map
            map_obj = folium.Map(location=[from_data.latitude, from_data.longitude], 
                               zoom_start=10)
            
            # Add markers
            folium.Marker([from_data.latitude, from_data.longitude],
                        popup="Start: " + from_data.address,
                        icon=folium.Icon(color='green')).add_to(map_obj)
            
            folium.Marker([to_data.latitude, to_data.longitude],
                        popup="End: " + to_data.address,
                        icon=folium.Icon(color='red')).add_to(map_obj)
            
            # Draw route line
            line_coordinates = [[from_data.latitude, from_data.longitude],
                              [to_data.latitude, to_data.longitude]]
            folium.PolyLine(line_coordinates, weight=2, color='blue').add_to(map_obj)
            
            # Calculate distance
            distance = geodesic((from_data.latitude, from_data.longitude),
                              (to_data.latitude, to_data.longitude)).kilometers
            
            # Ensure the static/maps directory exists
            os.makedirs(os.path.join('static', 'maps'), exist_ok=True)
            
            # Save map
            map_path = os.path.join('static', 'maps', 'direction_map.html')
            map_obj.save(map_path)
            
            return jsonify({
                'from_address': from_data.address,
                'to_address': to_data.address,
                'distance': round(distance, 2),
                'map_path': '/static/maps/direction_map.html'
            })
        else:
            return jsonify({'error': 'One or both locations not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Ensure the static/maps directory exists before starting the app
    os.makedirs(os.path.join('static', 'maps'), exist_ok=True)
    app.run(debug=True)