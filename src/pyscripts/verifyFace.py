import json, sys
from deepface import DeepFace

if __name__ == "__main__":

    img1_path = str(sys.argv[1])
    img2_path = str(sys.argv[2])

    verification = DeepFace.verify(img1_path=img1_path, img2_path=img2_path)

    verifyFaceResults = {
        "img1_path": img1_path,
        "img2_path": img2_path,
        "verification": verification,
    }

    # Serializing json
    json_object = json.dumps(verifyFaceResults, indent=4)

    # Writing to verifyFaceResults.json
    with open("verifyFaceResults.json", "w") as outfile:
        outfile.write(json_object)
