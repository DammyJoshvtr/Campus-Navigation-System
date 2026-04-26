"""
seed.py
-------
Seeds the database with all 36 campus locations from coordinates.json.

Safe to re-run: checks for existing records before inserting.

Usage:
    python seed.py
"""

from app import create_app, db
from app.models.location import Location

# ── All 36 campus locations ────────────────────────────────────────────────────

LOCATIONS = [
    {"id": 1,  "name": "21 - 24",                             "latitude": 7.681964, "longitude": 4.457061, "type": "Lecture Rooms"},
    {"id": 2,  "name": "17 - 20",                             "latitude": 7.682052, "longitude": 4.457355, "type": "Lecture Rooms"},
    {"id": 3,  "name": "13 - 16",                             "latitude": 7.682099, "longitude": 4.457530, "type": "Lecture Rooms"},
    {"id": 4,  "name": "9 - 12",                              "latitude": 7.682193, "longitude": 4.458001, "type": "Lecture Rooms"},
    {"id": 5,  "name": "5 - 8",                               "latitude": 7.682285, "longitude": 4.458214, "type": "Lecture Rooms"},
    {"id": 6,  "name": "1 - 4",                               "latitude": 7.682310, "longitude": 4.458472, "type": "Lecture Rooms"},
    {"id": 7,  "name": "Computing and Digital Tech Office",    "latitude": 7.682476, "longitude": 4.458616, "type": "Faculty"},
    {"id": 8,  "name": "Postgraduate College",                 "latitude": 7.682094, "longitude": 4.458695, "type": "Faculty"},
    {"id": 9,  "name": "NLT",                                  "latitude": 7.682003, "longitude": 4.458507, "type": "Lecture Rooms"},
    {"id": 10, "name": "MLT",                                  "latitude": 7.681943, "longitude": 4.458076, "type": "Lecture Rooms"},
    {"id": 11, "name": "ICT Lab 2",                            "latitude": 7.681886, "longitude": 4.457794, "type": "Laboratory"},
    {"id": 12, "name": "ICT Lab 1",                            "latitude": 7.681784, "longitude": 4.457469, "type": "Laboratory"},
    {"id": 13, "name": "Boja Theatre Art",                     "latitude": 7.681695, "longitude": 4.457152, "type": "Lecture Rooms"},
    {"id": 14, "name": "Zenith ICT ATM",                       "latitude": 7.680956, "longitude": 4.456225, "type": "Shopping"},
    {"id": 15, "name": "Former Faculty of Management Science", "latitude": 7.681419, "longitude": 4.457116, "type": "Faculty"},
    {"id": 16, "name": "Building near Peace Park",             "latitude": 7.680455, "longitude": 4.457356, "type": "Administrative"},
    {"id": 17, "name": "Faculty of Social Sciences",           "latitude": 7.680592, "longitude": 4.457779, "type": "Faculty"},
    {"id": 18, "name": "Tekena Tamuno Library",                "latitude": 7.681147, "longitude": 4.458117, "type": "Library"},
    {"id": 19, "name": "Former Natural Science Faculty",       "latitude": 7.681247, "longitude": 4.458603, "type": "Faculty"},
    {"id": 20, "name": "Bursar / General Studies Office",      "latitude": 7.680831, "longitude": 4.458734, "type": "Administrative"},
    {"id": 21, "name": "Registrar Office",                     "latitude": 7.680941, "longitude": 4.459156, "type": "Administrative"},
    {"id": 22, "name": "University Auditorium",                "latitude": 7.680313, "longitude": 4.459676, "type": "Event Centre"},
    {"id": 23, "name": "Staff Cooperative",                    "latitude": 7.678934, "longitude": 4.459755, "type": "Shopping"},
    {"id": 24, "name": "Nursery & Primary School",             "latitude": 7.678966, "longitude": 4.459279, "type": "School"},
    {"id": 25, "name": "Gethsemane Garden",                    "latitude": 7.679889, "longitude": 4.459026, "type": "Recreation"},
    {"id": 26, "name": "Vice Chancellor Office",               "latitude": 7.680338, "longitude": 4.458345, "type": "Administrative"},
    {"id": 27, "name": "Peace Park",                           "latitude": 7.680013, "longitude": 4.456955, "type": "Recreation"},
    {"id": 28, "name": "Container",                            "latitude": 7.679519, "longitude": 4.456491, "type": "Shopping"},
    {"id": 29, "name": "Manna Palace",                         "latitude": 7.678753, "longitude": 4.456962, "type": "Food & Dining"},
    {"id": 30, "name": "Health Center",                        "latitude": 7.677620, "longitude": 4.456507, "type": "Health"},
    {"id": 31, "name": "RUNSA Shop",                           "latitude": 7.676868, "longitude": 4.454908, "type": "Shopping"},
    {"id": 32, "name": "Male Extension",                       "latitude": 7.676678, "longitude": 4.455415, "type": "Hostel"},
    {"id": 33, "name": "Chief Olanipekun Hall",                "latitude": 7.677611, "longitude": 4.454607, "type": "Event Centre"},
    {"id": 34, "name": "Double Portion",                       "latitude": 7.675745, "longitude": 4.451565, "type": "Food & Dining"},
    {"id": 35, "name": "Chop LYFE",                            "latitude": 7.678271, "longitude": 4.452238, "type": "Food & Dining"},
    {"id": 36, "name": "Numbers Cafeteria",                    "latitude": 7.679443, "longitude": 4.451681, "type": "Food & Dining"},
]


def seed():
    app = create_app()
    with app.app_context():
        inserted = 0
        skipped  = 0

        for loc_data in LOCATIONS:
            exists = db.session.get(Location, loc_data["id"])
            if exists:
                skipped += 1
                continue

            location = Location(
                id        = loc_data["id"],
                name      = loc_data["name"],
                latitude  = loc_data["latitude"],
                longitude = loc_data["longitude"],
                type      = loc_data["type"],
            )
            db.session.add(location)
            inserted += 1

        db.session.commit()
        print(f"Seed complete: {inserted} inserted, {skipped} already existed.")


if __name__ == "__main__":
    seed()
