import {
  deploy,
  submitPageAppProof,
  getPageAppState,
  createLocalBlockchain,
  PageApp,
} from './pageapp';

import { authority, generateAgeProof } from './page-lib';

import {
  isReady,
  shutdown,
  PrivateKey,
  PublicKey,
  Field,
  Poseidon,
} from 'snarkyjs';

describe('pageApp', () => {
  let pageAppInstance: PageApp,
    pageAppPrivateKey: PrivateKey,
    pageAppAddress: PublicKey,
    person: { personSecretID: number; age: number },
    authorityEncryptedAge: Field,
    account: PrivateKey;

  beforeEach(async () => {
    await isReady;
    account = createLocalBlockchain();
    pageAppPrivateKey = PrivateKey.random();
    pageAppAddress = pageAppPrivateKey.toPublicKey();
    pageAppInstance = new PageApp(pageAppAddress);
    person = { personSecretID: 123456789, age: 32 };
    authorityEncryptedAge = authority(person);
    return;
  });

  afterAll(async () => {
    setTimeout(shutdown, 0);
  });

  it('generates and deploys page app', async () => {
    await deploy(
      pageAppInstance,
      pageAppPrivateKey,
      authorityEncryptedAge,
      account
    );

    let state = getPageAppState(pageAppInstance);
    expect(state).toBeDefined();
    expect(state.isOlderThanEighteen).toBe(false);
  });

  it('accepts a correct solution', async () => {
    await deploy(
      pageAppInstance,
      pageAppPrivateKey,
      authorityEncryptedAge,
      account
    );

    let state = getPageAppState(pageAppInstance);
    expect(state).toBeDefined();
    expect(state.isOlderThanEighteen).toBe(false);

    let proof = generateAgeProof(person);
    if (proof === undefined) throw Error('cannot happen');
    let accepted = await submitPageAppProof(
      proof,
      account,
      pageAppAddress,
      pageAppPrivateKey
    );
    expect(accepted).toBe(true);

    let { isOlderThanEighteen } = getPageAppState(pageAppInstance);
    expect(isOlderThanEighteen).toBe(true);
  });

  it('rejects an incorrect solution', async () => {
    await deploy(
      pageAppInstance,
      pageAppPrivateKey,
      authorityEncryptedAge,
      account
    );

    let proof = generateAgeProof(person);
    if (proof === undefined) throw Error('cannot happen');

    let noProof = Poseidon.hash([proof]);

    expect.assertions(1);
    try {
      await submitPageAppProof(
        noProof,
        account,
        pageAppAddress,
        pageAppPrivateKey
      );
    } catch (e) {
      // Hash values will not match.
      // This will cause an assert.
    }

    let { isOlderThanEighteen } = await getPageAppState(pageAppInstance);
    expect(isOlderThanEighteen).toBe(false);
  });
});
