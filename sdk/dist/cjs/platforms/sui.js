"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_connect_1 = require("@wormhole-foundation/sdk-connect");
const _sui = __importStar(require("@wormhole-foundation/sdk-sui"));
/** Platform and protocol definitions for Sui */
const sui = {
    Address: _sui.SuiAddress,
    Platform: _sui.SuiPlatform,
    getSigner: _sui.getSuiSigner,
    protocols: {
        WormholeCore: () => Promise.resolve().then(() => __importStar(require("@wormhole-foundation/sdk-sui-core"))),
        TokenBridge: () => Promise.resolve().then(() => __importStar(require("@wormhole-foundation/sdk-sui-tokenbridge"))),
        // TODO uncomment when enabling Sui CCTP
        //CircleBridge: () => import("@wormhole-foundation/sdk-sui-cctp"),
    },
    getChain: (network, chain, overrides) => new _sui.SuiChain(chain, new _sui.SuiPlatform(network, (0, sdk_connect_1.applyChainsConfigConfigOverrides)(network, _sui._platform, { [chain]: overrides }))),
};
exports.default = sui;
//# sourceMappingURL=sui.js.map