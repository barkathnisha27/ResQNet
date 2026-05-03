import json
from ml_engine.inference import run_disaster_model

inputs = {
    'severity': 4,
    'people_affected': 50,
    'latitude': 12.97,
    'longitude': 77.59,
}

tests = ['floods', 'flood', 'drought', 'tsunami', 'cyclone', 'unknown']

for t in tests:
    try:
        res = run_disaster_model(t, inputs)
    except Exception as e:
        res = {'error': str(e)}
    print(t, json.dumps(res))
