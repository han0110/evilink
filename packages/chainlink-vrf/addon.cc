#include <napi.h>

#include "./go/build/chainlink_vrf.h"

Napi::Object NapiPublicKey(const Napi::CallbackInfo& info) {
  auto env = info.Env();

  auto privateKey = info[0].As<Napi::Buffer<unsigned char>>();

  auto ret =
      PublicKey(GoSlice{.data = privateKey.Data(), .len = 32, .cap = 32});

  Napi::String x = Napi::String::New(env, ret.r0);
  Napi::String y = Napi::String::New(env, ret.r1);
  Napi::String hash = Napi::String::New(env, ret.r2);

  auto publicKey = Napi::Object::New(env);
  publicKey.Set("x", x);
  publicKey.Set("y", y);
  publicKey.Set("hash", hash);

  delete ret.r0;
  delete ret.r1;
  delete ret.r2;

  return publicKey;
}

Napi::Object NapiGenerateProof(const Napi::CallbackInfo& info) {
  auto env = info.Env();

  auto privateKey = info[0].As<Napi::Buffer<unsigned char>>();
  auto preSeed = info[1].As<Napi::Buffer<unsigned char>>();
  auto blockHash = info[2].As<Napi::Buffer<unsigned char>>();
  auto blockNumber = info[3].As<Napi::Number>();

  auto ret =
      GenerateProof(GoSlice{.data = privateKey.Data(), .len = 32, .cap = 32},
                    GoSlice{.data = preSeed.Data(), .len = 32, .cap = 32},
                    GoSlice{.data = blockHash.Data(), .len = 32, .cap = 32},
                    static_cast<GoUint64>(blockNumber.Int64Value()));

  auto proof = Napi::Object::New(env);
  if (ret.r3 != NULL) {
    Napi::TypeError::New(env, ret.r3).ThrowAsJavaScriptException();
  } else {
    proof.Set("randomness", ret.r0);
    proof.Set("packed", ret.r1);
    proof.Set("packedForContractInput", ret.r2);
  }

  delete ret.r0;
  delete ret.r1;
  delete ret.r2;
  delete ret.r3;

  return proof;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "publicKey"),
              Napi::Function::New(env, NapiPublicKey));
  exports.Set(Napi::String::New(env, "generateProof"),
              Napi::Function::New(env, NapiGenerateProof));
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
