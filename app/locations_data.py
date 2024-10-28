# app/locations_data.py
import random
from datetime import datetime, timedelta, date

# =====================================
# Constant Data and Lists
# =====================================

CITIES = [
    # Java
    {"name": "Cianjur", "lat": -6.8169, "lng": 107.1451, "region": "West Java"},
    {"name": "Bandung", "lat": -6.8137, "lng": 107.6219, "region": "West Java"},
    {"name": "Sukabumi", "lat": -6.9277, "lng": 106.9300, "region": "West Java"},
    {"name": "Indramayu", "lat": -6.3373, "lng": 108.3207, "region": "West Java"},
    {"name": "Brebes", "lat": -6.8584, "lng": 109.0435, "region": "Central Java"},
    {"name": "Wonosobo", "lat": -7.3632, "lng": 109.9001, "region": "Central Java"},
    {"name": "Malang", "lat": -7.9666, "lng": 112.6326, "region": "East Java"},
    {"name": "Banyuwangi", "lat": -8.2191, "lng": 114.3691, "region": "East Java"},
    {"name": "Kediri", "lat": -7.8480, "lng": 112.0178, "region": "East Java"},
    
    # Sumatra
    {"name": "Medan", "lat": 3.5952, "lng": 98.6722, "region": "North Sumatra"},
    {"name": "Palembang", "lat": -2.9761, "lng": 104.7754, "region": "South Sumatra"},
    {"name": "Lampung", "lat": -5.4501, "lng": 105.2687, "region": "Lampung"},
    
    # Sulawesi
    {"name": "Makassar", "lat": -5.1477, "lng": 119.4327, "region": "South Sulawesi"},
    {"name": "Manado", "lat": 1.4748, "lng": 124.8421, "region": "North Sulawesi"},
    
    # Kalimantan
    {"name": "Banjarmasin", "lat": -3.3186, "lng": 114.5944, "region": "South Kalimantan"},
    {"name": "Pontianak", "lat": -0.0263, "lng": 109.3425, "region": "West Kalimantan"}
]

PRODUCTS = {
    "grains": [
        {
            "name": "Pandan Wangi Rice",
            "tonnage_range": (500, 1000),
            "harvest_months": [3, 7, 11]
        },
        {
            "name": "IR64 Rice",
            "tonnage_range": (600, 1200),
            "harvest_months": [4, 8, 12]
        },
        {
            "name": "Sweet Corn",
            "tonnage_range": (300, 600),
            "harvest_months": [3, 4, 5, 9, 10, 11]
        },
        {
            "name": "Yellow Corn",
            "tonnage_range": (400, 800),
            "harvest_months": [3, 4, 5, 9, 10, 11]
        }
    ],
    "horticulture": [
        {
            "name": "Premium Broccoli",
            "tonnage_range": (20, 50),
            "harvest_months": range(1, 13)
        },
        {
            "name": "Red Chili",
            "tonnage_range": (30, 70),
            "harvest_months": [4, 5, 6, 7, 8, 9]
        },
        {
            "name": "Potatoes",
            "tonnage_range": (100, 300),
            "harvest_months": range(1, 13)
        },
        {
            "name": "Carrots",
            "tonnage_range": (50, 150),
            "harvest_months": range(1, 13)
        }
    ],
    "fisheries": [
        {
            "name": "Vannamei Shrimp",
            "tonnage_range": (50, 150),
            "harvest_months": range(1, 13)
        },
        {
            "name": "Milkfish",
            "tonnage_range": (70, 200),
            "harvest_months": range(1, 13)
        },
        {
            "name": "Tuna",
            "tonnage_range": (100, 300),
            "harvest_months": range(1, 13)
        }
    ],
    "plantations": [
        {
            "name": "Arabica Coffee",
            "tonnage_range": (50, 150),
            "harvest_months": [6, 7, 8, 9]
        },
        {
            "name": "Palm Oil",
            "tonnage_range": (1000, 2000),
            "harvest_months": range(1, 13)
        },
        {
            "name": "Cocoa",
            "tonnage_range": (200, 500),
            "harvest_months": [5, 6, 7, 8, 9]
        },
        {
            "name": "Tea Leaves",
            "tonnage_range": (300, 600),
            "harvest_months": range(1, 13)
        }
    ],
    "poultry": [
        {
            "name": "Broiler Chicken",
            "tonnage_range": (30, 100),
            "harvest_months": range(1, 13)
        },
        {
            "name": "Layer Chicken",
            "tonnage_range": (20, 80),
            "harvest_months": range(1, 13)
        },
        {
            "name": "Duck",
            "tonnage_range": (15, 60),
            "harvest_months": range(1, 13)
        }
    ]
}

COMPANY_TYPES = ["PT", "CV", "UD"]
COMPANY_QUALITIES = ["Makmur", "Sejahtera", "Prima", "Jaya", "Utama"]
COMPANY_ACTIVITIES = ["Tani", "Pangan", "Hasil", "Sumber", "Mitra"]

# =====================================
# Helper Functions
# =====================================

def generate_phone():
    """Generate realistic Indonesian phone number"""
    prefix = random.choice(['0812', '0813', '0821', '0822', '0852', '0853'])
    suffix = ''.join([str(random.randint(0, 9)) for _ in range(8)])
    return f"{prefix}-{suffix[:4]}-{suffix[4:]}"

def generate_company_name(product_name):
    """Generate realistic Indonesian company name"""
    company_type = random.choice(COMPANY_TYPES)
    activity = random.choice(COMPANY_ACTIVITIES)
    quality = random.choice(COMPANY_QUALITIES)
    return f"{company_type} {activity} {product_name} {quality}"

def generate_description(product_name, category):
    """Generate contextual description based on product and category"""
    descriptions = {
        "grains": [
            f"Premium {product_name} producer with modern processing facilities",
            f"Sustainable {product_name} farming with high-quality standards",
            f"Leading {product_name} supplier in the region"
        ],
        "horticulture": [
            f"Fresh {product_name} from highland farms",
            f"Organic {product_name} producer with controlled environment",
            f"Quality {product_name} supplier with cold chain facility"
        ],
        "fisheries": [
            f"Sustainable {product_name} supplier with modern facilities",
            f"Fresh {product_name} producer with cold storage system",
            f"Premium {product_name} farm with international standards"
        ],
        "plantations": [
            f"Large scale {product_name} plantation with processing facilities",
            f"Sustainable {product_name} producer with modern technology",
            f"Premium {product_name} plantation with quality control"
        ],
        "poultry": [
            f"Modern {product_name} farm with strict health protocols",
            f"Quality {product_name} producer with biosecurity system",
            f"Certified {product_name} farm with modern facilities"
        ]
    }
    return random.choice(descriptions.get(category, [f"Quality {product_name} supplier"]))

def generate_sell_period(product_harvest_months):
    """Generate realistic sell periods based on harvest months"""
    current_year = datetime.now().year
    today = date.today()
    
    if len(product_harvest_months) == 12:  # Year-round production
        start_date = today + timedelta(days=random.randint(15, 45))
        duration = random.randint(90, 120)
        end_date = start_date + timedelta(days=duration)
        return start_date.isoformat(), end_date.isoformat()
    
    harvest_month = random.choice(list(product_harvest_months))
    start_date = date(current_year, harvest_month, random.randint(1, 28))
    post_harvest_delay = random.randint(14, 28)
    start_date = start_date + timedelta(days=post_harvest_delay)
    
    sell_duration = random.randint(60, 90)
    end_date = start_date + timedelta(days=sell_duration)
    
    if start_date < today:
        days_to_add = (today - start_date).days + random.randint(15, 45)
        start_date = today + timedelta(days=days_to_add)
        end_date = start_date + timedelta(days=sell_duration)
    
    return start_date.isoformat(), end_date.isoformat()

# =====================================
# Main Data Generation
# =====================================

def generate_location_data(num_locations=50):
    """Generate complete location dataset"""
    locations = []
    used_combinations = set()

    while len(locations) < num_locations:
        city = random.choice(CITIES)
        category = random.choice(list(PRODUCTS.keys()))
        product = random.choice(PRODUCTS[category])

        # Ensure unique city-product combination
        combination = (city["name"], product["name"])
        if combination in used_combinations:
            continue
        used_combinations.add(combination)

        # Generate sell period dates
        start_date, end_date = generate_sell_period(product["harvest_months"])

        # Generate tonnage within product's range
        min_tonnage, max_tonnage = product["tonnage_range"]
        tonnage = random.randint(min_tonnage, max_tonnage)

        # Add some random variation to coordinates
        lat_offset = random.uniform(-0.05, 0.05)
        lng_offset = random.uniform(-0.05, 0.05)

        location = {
            "name": generate_company_name(product["name"]),
            "lat": city["lat"] + lat_offset,
            "lng": city["lng"] + lng_offset,
            "city": city["name"],
            "description": generate_description(product["name"], category),
            "products": [{
                "name": product["name"],
                "category": category,
                "tonnage": tonnage,
                "sell_period": {
                    "start": start_date,
                    "end": end_date
                }
            }],
            "contact": generate_phone()
        }
        locations.append(location)

    return {"locations": locations}

# Generate the locations data
locations = generate_location_data(50)


# Save to JSON file if run directly
if __name__ == "__main__":
    import json
    from pathlib import Path

    # Create a timestamp for the filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f'locations_{timestamp}.json'

    # Save with pretty printing
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(locations, f, indent=2, ensure_ascii=False)
    
    print(f"Generated {len(locations['locations'])} locations")
    print(f"Saved to {filename}")
    
    # Print a sample entry
    print("\nSample entry:")
    print(json.dumps(locations["locations"][0], indent=2))
