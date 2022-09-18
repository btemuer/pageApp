import { PythonShell, PythonShellError } from 'python-shell';
import fs from 'fs';

export { recognizePassport };

async function recognizePassport(
  selfie_img_path: string,
  pass_img_path: string
): Promise<{
  personSecretID: number;
  age: number;
}> {
  const verified: null | boolean = await verifyFace(
    selfie_img_path,
    pass_img_path
  );

  if (!verified) {
    throw 'Passport image and selfie do not match!';
  }
  console.log('\nPassport image and selfie match: %s', verified);

  const passportData: any = await getPassportData(pass_img_path);
  if (passportData.valid_score < 95 || !passportData.valid_date_of_birth) {
    throw 'Cannot trust this passport!';
  }
  console.log(
    '\nPassport is valid.\nDate of birth: %s',
    passportData.date_of_birth
  );

  return {
    personSecretID: computeSecretID(passportData),
    age: computeAge(passportData),
  };
}

async function verifyFace(
  selfie_img_path: string,
  pass_img_path: string
): Promise<null | boolean> {
  let verifyFaceOptions = {
    scriptPath: './src/pyscripts/',
    args: [selfie_img_path, pass_img_path],
  };

  const faceVerification: { success: boolean; err?: string } =
    await new Promise((resolve, reject) => {
      PythonShell.run(
        'verifyFace.py',
        verifyFaceOptions,
        function (err?: PythonShellError) {
          if (err) {
            reject({ success: false, err: err });
          } else {
            resolve({ success: true });
          }
        }
      );
    });

  if (!faceVerification.success) {
    console.log('Error at face verification: %s', faceVerification.err);
    return null;
  }

  const verificationResults: any = JSON.parse(
    fs.readFileSync('./verifyFaceResults.json', 'utf-8')
  );

  return verificationResults.verification.verified;
}

async function getPassportData(pass_img_path: string): Promise<any> {
  const getPassportDataOptions = {
    scriptPath: './src/pyscripts/',
    args: [pass_img_path],
  };

  const readingPassportMRZ: { success: boolean; err?: string } =
    await new Promise((resolve, reject) => {
      PythonShell.run(
        'getPassportData.py',
        getPassportDataOptions,
        function (err?: PythonShellError) {
          if (err) {
            reject({ success: false, err: err });
          } else {
            resolve({ success: true });
          }
        }
      );
    });

  if (!readingPassportMRZ.success) {
    console.log('Error at face verification: %s', readingPassportMRZ.err);
    return null;
  }

  const passportData: any = JSON.parse(
    fs.readFileSync('./passportData.json', 'utf-8')
  );

  return passportData;
}

function computeSecretID(passportData: any): number {
  return (
    parseInt(passportData.date_of_birth.replace(/-/g, '')) +
    parseInt(passportData.expiration_date)
  );
}

function computeAge(passportData: any): number {
  const today = new Date();
  const birthDate = new Date(passportData.date_of_birth);

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}
