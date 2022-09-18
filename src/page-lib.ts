import { Field, Poseidon } from 'snarkyjs';

import { recognizePassport } from './passportRecognition.js';

export { authority, generateAgeProof, authorityPassportRecognition };

function authority(person: { personSecretID: number; age: number }): Field {
  let encryptedAge = Poseidon.hash([new Field(person.personSecretID)]);

  for (let i = 0; i < person.age + 1; ++i)
    encryptedAge = Poseidon.hash([encryptedAge]);

  return encryptedAge;
}

function generateAgeProof(person: {
  personSecretID: number;
  age: number;
}): Field {
  const ageToProve = 18;

  let ageProof = Poseidon.hash([new Field(person.personSecretID)]);
  for (let i = 0; i < person.age + 1 - ageToProve; ++i)
    ageProof = Poseidon.hash([ageProof]);

  return ageProof;
}

async function authorityPassportRecognition(
  selfie_img_path: string,
  pass_img_path: string
): Promise<Field> {
  const person: any = await recognizePassport(selfie_img_path, pass_img_path);
  console.log(person);

  let encryptedAge = Poseidon.hash([new Field(person.personSecretID)]);

  for (let i = 0; i < person.age + 1; ++i)
    encryptedAge = Poseidon.hash([encryptedAge]);

  return encryptedAge;
}
