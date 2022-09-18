/**
 * This file specifies how to run the `PageApp` smart contract locally using the `Mina.LocalBlockchain()` method.
 * The `Mina.LocalBlockchain()` method specifies a ledger of accounts and contains logic for updating the ledger.
 *
 * To run locally:
 * Build the project: `$ npm run build`
 * Run with node:     `$ node build/src/run.js`.
 */
import {
  deploy,
  submitPageAppProof,
  getPageAppState,
  createLocalBlockchain,
  PageApp,
} from './pageapp.js';

import {
  authority,
  // authorityPassportRecognition,
  generateAgeProof,
} from './page-lib.js';

import { Poseidon, PrivateKey, shutdown } from 'snarkyjs';

// setup
const account = createLocalBlockchain();

// Obtain an encrypted age description - two choices
const authorityEncryptedAge = authority({ personSecretID: 19811843, age: 58 });
/*
const authorityEncryptedAge = await authorityPassportRecognition(
  'images/Mustermann_Selfie.jpg',
  'images/Mustermann_Passport.jpg'
);
*/

const pageAppPrivateKey = PrivateKey.random();
const pageAppAddress = pageAppPrivateKey.toPublicKey();

// create an instance of the smart contract
const pageAppInstance = new PageApp(pageAppAddress);

console.log('\nDeploying Page App...');
await deploy(
  pageAppInstance,
  pageAppPrivateKey,
  authorityEncryptedAge,
  account
);

console.log(
  'Initial state:\nIs age > 18 proven?',
  getPageAppState(pageAppInstance).isOlderThanEighteen
);

// generate a valid proof
const proof = generateAgeProof({ personSecretID: 19811843, age: 58 });
if (proof === undefined) throw Error('cannot happen');

// submit a wrong Proof
// break the actual proof
const noProof = Poseidon.hash([proof]);

console.log('\nSubmitting wrong proof...');
try {
  await submitPageAppProof(noProof, account, pageAppAddress, pageAppPrivateKey);
} catch {
  console.log('There was an error submitting the proof!');
}
console.log(
  'Current state:\nIs age > 18 proven?',
  getPageAppState(pageAppInstance).isOlderThanEighteen
);

// submit the actual proof
console.log('\nSubmitting proof...');
await submitPageAppProof(proof, account, pageAppAddress, pageAppPrivateKey);
console.log(
  'Current state:\nIs age > 18 proven?',
  getPageAppState(pageAppInstance).isOlderThanEighteen
);

// cleanup
await shutdown();
