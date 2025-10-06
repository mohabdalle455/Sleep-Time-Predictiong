import requests
import json

# Test data from the user's example
test_data = {
    "features": [0, 0, 3.29, 18.7, 33, 0]
}

try:
    response = requests.post(
        "http://localhost:9000/predict",
        headers={"Content-Type": "application/json"},
        json=test_data
    )
    print("Status Code:", response.status_code)
    print("Response:", json.dumps(response.json(), indent=2))
except Exception as e:
    print("Error:", str(e))