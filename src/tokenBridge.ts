import type { Chain, Network, TokenId } from "@wormhole-foundation/sdk";
import {
  TokenTransfer,
  Wormhole,
  amount,
  isTokenId,
  wormhole,
} from "@wormhole-foundation/sdk";

// Import the platform-specific packages

import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import type { SignerStuff } from "./helpers/index.js";
import { getSigner, waitLog } from "./helpers/index.js";

// src/tokenBridge.ts
import { tokenTransfer } from "./helpers/tokenTransfer";

(async function () {
  // Init Wormhole object, passing config for which network
  // to use (e.g. Mainnet/Testnet) and what Platforms to support
  const wh = await wormhole("Testnet", [evm, solana]);

  // Grab chain Contexts -- these hold a reference to a cached rpc client
  const sendChain = wh.getChain("Avalanche");
  const rcvChain = wh.getChain("Solana");

  // Shortcut to allow transferring native gas token
  const token = Wormhole.tokenId(sendChain.chain, "native");

  // A TokenId is just a `{chain, address}` pair and an alias for ChainAddress
  // The `address` field must be a parsed address.
  // You can get a TokenId (or ChainAddress) prepared for you
  // by calling the static `chainAddress` method on the Wormhole class.
  // e.g.
  // wAvax on Solana
  // const token = Wormhole.tokenId("Solana", "3Ftc5hTz9sG4huk79onufGiebJNDMZNL8HYgdMJ9E7JR");
  // wSol on Avax
  // const token = Wormhole.tokenId("Avalanche", "0xb10563644a6AB8948ee6d7f5b0a1fb15AaEa1E03");

  // Normalized given token decimals later but can just pass bigints as base units
  // Note: The Token bridge will dedust past 8 decimals
  // this means any amount specified past that point will be returned
  // to the caller
  const amt = "0.05";

  // With automatic set to true, perform an automatic transfer. This will invoke a relayer
  // contract intermediary that knows to pick up the transfers
  // With automatic set to false, perform a manual transfer from source to destination
  // of the token
  // On the destination side, a wrapped version of the token will be minted
  // to the address specified in the transfer VAA
  const automatic = false;

  // The automatic relayer has the ability to deliver some native gas funds to the destination account
  // The amount specified for native gas will be swapped for the native gas token according
  // to the swap rate provided by the contract, denominated in native gas tokens
  const nativeGas = automatic ? "0.01" : undefined;

  // Get signer from local key but anything that implements
  // Signer interface (e.g. wrapper around web wallet) should work
  const source = await getSigner(sendChain);
  const destination = await getSigner(rcvChain);

  // Used to normalize the amount to account for the tokens decimals
  const decimals = isTokenId(token)
    ? Number(await wh.getDecimals(token.chain, token.address))
    : sendChain.config.nativeTokenDecimals;

  // Set this to true if you want to perform a round trip transfer
  const roundTrip: boolean = false;

  // Set this to the transfer txid of the initiating transaction to recover a token transfer
  // and attempt to fetch details about its progress.
  let recoverTxid = undefined;
  // recoverTxid = "0xa4e0a2c1c994fe3298b5646dfd5ce92596dc1a589f42e241b7f07501a5a5a39f";

  // Finally create and perform the transfer given the parameters set above
  const xfer = !recoverTxid
    ? // Perform the token transfer
      await tokenTransfer(
        wh,
        {
          token,
          amount: amount.units(amount.parse(amt, decimals)),
          source,
          destination,
          delivery: {
            automatic,
            nativeGas: nativeGas
              ? amount.units(amount.parse(nativeGas, decimals))
              : undefined,
          },
        },
        roundTrip
      )
    : // Recover the transfer from the originating txid
      await TokenTransfer.from(wh, {
        chain: source.chain.chain,
        txid: recoverTxid,
      });

  const receipt = await waitLog(wh, xfer);

  // Log out the results
  console.log(receipt);
})();
