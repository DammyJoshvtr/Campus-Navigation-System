"""
seed.py – Populate the database with sample campus data.

Usage:
    python seed.py
"""
from run import app, db
from app.models.location import Location


SAMPLE_LOCATIONS = [
    {
        "name": "Main Library",
        "description": "Central library with study rooms, journals, and digital resources.",
        "latitude": 6.5248,
        "longitude": 3.3792,
        "type": "Library",
        "building_code": "LIB-01",
        "floor": 1,
    },
    {
        "name": "Engineering Faculty Block A",
        "description": "Houses Civil, Mechanical and Electrical departments.",
        "latitude": 6.5255,
        "longitude": 3.3801,
        "type": "Faculty",
        "building_code": "ENG-A",
        "floor": 0,
    },
    {
        "name": "Computer Science Department",
        "description": "CS labs, lecture halls, and faculty offices.",
        "latitude": 6.5261,
        "longitude": 3.3810,
        "type": "Faculty",
        "building_code": "CS-01",
        "floor": 0,
    },
    {
        "name": "Lecture Hall 1 (LH1)",
        "description": "500-seat auditorium for large classes.",
        "latitude": 6.5244,
        "longitude": 3.3785,
        "type": "Lecture Room",
        "building_code": "LH-01",
        "floor": 0,
    },
    {
        "name": "Lecture Hall 2 (LH2)",
        "description": "300-seat lecture hall.",
        "latitude": 6.5240,
        "longitude": 3.3788,
        "type": "Lecture Room",
        "building_code": "LH-02",
        "floor": 0,
    },
    {
        "name": "Student Cafeteria",
        "description": "Main campus dining hall serving breakfast, lunch, and dinner.",
        "latitude": 6.5252,
        "longitude": 3.3798,
        "type": "Cafeteria",
        "building_code": "CAF-01",
        "floor": 0,
    },
    {
        "name": "Science Laboratory Complex",
        "description": "Physics, Chemistry, and Biology laboratories.",
        "latitude": 6.5258,
        "longitude": 3.3806,
        "type": "Laboratory",
        "building_code": "SCI-LAB",
        "floor": 0,
    },
    {
        "name": "Campus Clinic",
        "description": "Medical services for students and staff.",
        "latitude": 6.5235,
        "longitude": 3.3780,
        "type": "Clinic",
        "building_code": "CLN-01",
        "floor": 0,
    },
    {
        "name": "Sports Complex",
        "description": "Football pitch, basketball courts, and gym.",
        "latitude": 6.5270,
        "longitude": 3.3820,
        "type": "Sports Facility",
        "building_code": "SPT-01",
        "floor": None,
    },
    {
        "name": "Administration Block",
        "description": "Bursary, registry, and university administration offices.",
        "latitude": 6.5246,
        "longitude": 3.3790,
        "type": "Administrative",
        "building_code": "ADM-01",
        "floor": 0,
    },
    {
        "name": "Male Hostel A",
        "description": "On-campus accommodation for male students.",
        "latitude": 6.5278,
        "longitude": 3.3815,
        "type": "Hostel",
        "building_code": "HST-MA",
        "floor": 0,
    },
    {
        "name": "Female Hostel B",
        "description": "On-campus accommodation for female students.",
        "latitude": 6.5275,
        "longitude": 3.3812,
        "type": "Hostel",
        "building_code": "HST-FB",
        "floor": 0,
    },
    {
        "name": "University Chapel",
        "description": "Interfaith chapel for worship and quiet reflection.",
        "latitude": 6.5242,
        "longitude": 3.3795,
        "type": "Chapel",
        "building_code": "CHP-01",
        "floor": 0,
    },
    {
        "name": "Main Parking Lot",
        "description": "Primary vehicle parking area near the administration block.",
        "latitude": 6.5243,
        "longitude": 3.3787,
        "type": "Parking",
        "building_code": None,
        "floor": None,
    },
]


def seed():
    with app.app_context():
        existing = Location.query.count()
        if existing:
            print(f"Database already has {existing} location(s). Skipping seed.")
            return

        for loc_data in SAMPLE_LOCATIONS:
            loc = Location(**loc_data)
            db.session.add(loc)

        db.session.commit()
        print(f"Seeded {len(SAMPLE_LOCATIONS)} campus locations successfully.")


if __name__ == "__main__":
    seed()
