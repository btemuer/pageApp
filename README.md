# Mina zkApp: PageApp

This is a very early demo of a program for PrivateAGE verification (if user is older than 18 years) in terms of a zero-knowledge proof on the Mina blockchain.

Implements a zero-knowledge proof of age using hash chains based on:

- https://www.stratumn.com/en/blog/zero-knowledge-proof-of-age-using-hash-chains/

There are two choices to obtain an encrypted age description:

- simple (no authority, just get the age encryption after manually providing a secretID and age)
- emulate authority by a facial verification / identification pipeline, which:

  - receives a passport and a selfie image.
  - returns an age encryption given that facial verification was successful and the document can be assumed valid
  - To be able to run the pipeline with the passport recognition, you will need [PassportEye](https://github.com/konstantint/PassportEye) and [Deepface](https://github.com/serengil/deepface) globally accessible.

Unfortunately, there is no UI or a CLI. The project structure is very similar to the sudoku example of the zkapp-cli, therefore should be easy-to-understand. The smart contract and its surrounding functionality are implemented in `pageapp.ts`. The functionality to compute the age encryption and generating the proof can be found in `pageapp-lib.ts`. I strongly encourage to look at the reference above to quickly understand how the smart contract works.

The zkApp state consists of a `Field` representing an encrypted age value originating from a trusted authority (or an emulation thereof), and a `Bool` stating if the age verification statement - "The user is older than 18" - is proven or not.

The zkApp can be run locally, just like the sudoku example.

Without the passport recognition, the output of running locally will look like this:

![authority](https://user-images.githubusercontent.com/44878998/190929336-f74e8550-75c2-44bc-b7c6-7795fc8f4587.png)

With the passport recognition, the output will be:

![authorityPassport](https://user-images.githubusercontent.com/44878998/190929361-bf6bab41-c1b9-4e5b-b441-7947aa677ed4.png)

## How to build

```sh
npm run build
```

## How to run tests

(Please take care of the import statement on line 3 in `page-lib.ts` before running the tests. Just delete the `.js` at the end. I do not know where this error comes from.)

```sh
npm run test
npm run testw # watch mode
```

## How to run coverage

```sh
npm run coverage
```

## License

[Apache-2.0](LICENSE)
