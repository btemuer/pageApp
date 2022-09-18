import json, sys
from passporteye import read_mrz


if __name__ == "__main__":

    pass_img_path = str(sys.argv[1])

    pass_mrz = read_mrz(file=pass_img_path, extra_cmdline_params="--oem 0").to_dict()

    pass_mrz["date_of_birth"] = (
        pass_mrz["date_of_birth"][:2]
        + "-"
        + pass_mrz["date_of_birth"][2:4]
        + "-"
        + pass_mrz["date_of_birth"][4:]
    )

    if int(pass_mrz["date_of_birth"][:2]) < 22:
        pass_mrz["date_of_birth"] = "20" + pass_mrz["date_of_birth"]
    else:
        pass_mrz["date_of_birth"] = "19" + pass_mrz["date_of_birth"]

    print(pass_mrz["date_of_birth"])

    # Serializing json
    json_object = json.dumps(pass_mrz, indent=4)

    # Writing to passportData.json
    with open("passportData.json", "w") as outfile:
        outfile.write(json_object)
