import requests
import json

# Test the model server with the example data
test_data = {
    "features": [0, 0, 3.29, 18.7, 33, 0]
}

try:
    response = requests.post(
        "http://localhost:9000/predict",
        headers={"Content-Type": "application/json"},
        data=json.dumps(test_data)
    )
    print("Status Code:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("Error:", str(e))