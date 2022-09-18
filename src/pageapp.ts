import {
  AccountUpdate,
  Bool,
  Field,
  isReady,
  method,
  Mina,
  Permissions,
  Poseidon,
  PrivateKey,
  PublicKey,
  SmartContract,
  state,
  State,
} from 'snarkyjs';

export { deploy, submitPageAppProof, getPageAppState, createLocalBlockchain };

await isReady;

export class PageApp extends SmartContract {
  @state(Field) encryptedAge = State<Field>();
  @state(Bool) isOlderThanEighteen = State<Bool>();

  @method init(authorityEncryptedAge: Field) {
    this.encryptedAge.set(authorityEncryptedAge);
    this.isOlderThanEighteen.set(Bool(false));
  }

  @method submitAgeProof(ageProof: Field) {
    const ageToProve = 18;

    const encryptedAge = this.encryptedAge.get();
    this.encryptedAge.assertEquals(encryptedAge);

    let hashChainValue = ageProof;

    for (let i = 0; i < ageToProve; ++i) {
      hashChainValue = Poseidon.hash([hashChainValue]);
    }

    hashChainValue.assertEquals(encryptedAge);

    this.isOlderThanEighteen.set(Bool(true));
  }
}

function createLocalBlockchain(): PrivateKey {
  let Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);

  const account = Local.testAccounts[0].privateKey;
  return account;
}

async function deploy(
  pageAppInstance: PageApp,
  pageAppPrivateKey: PrivateKey,
  authorityEncryptedAge: Field,
  account: PrivateKey
) {
  let tx = await Mina.transaction(account, () => {
    AccountUpdate.fundNewAccount(account);

    pageAppInstance.deploy({ zkappKey: pageAppPrivateKey });
    pageAppInstance.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });

    pageAppInstance.init(authorityEncryptedAge);
    pageAppInstance.sign(pageAppPrivateKey);
  });

  await tx.send().wait();
}

async function submitPageAppProof(
  ageProof: Field,
  account: PrivateKey,
  pageAppAddress: PublicKey,
  pageAppPrivateKey: PrivateKey
) {
  let tx = await Mina.transaction(account, () => {
    let pageApp = new PageApp(pageAppAddress);
    pageApp.submitAgeProof(ageProof);
    pageApp.sign(pageAppPrivateKey);
  });
  try {
    await tx.send().wait();
    return true;
  } catch (err) {
    return false;
  }
}

function getPageAppState(pageAppInstance: PageApp) {
  return {
    isOlderThanEighteen: pageAppInstance.isOlderThanEighteen.get().toBoolean(),
  };
}
