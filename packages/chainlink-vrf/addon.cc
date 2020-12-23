#include <napi.h>

#include "./go/build/chainlink_vrf.h"

Napi::String NapiGenVRFRandomness(const Napi::CallbackInfo& info) {
  auto env = info.Env();

  auto privateKey = info[0].As<Napi::Buffer<unsigned char>>();
  auto preSeed = info[1].As<Napi::Buffer<unsigned char>>();
  auto blockHash = info[2].As<Napi::Buffer<unsigned char>>();
  auto blockNumber = info[3].As<Napi::Number>();

  auto ret =
      GenVRFRandomness(GoSlice{.data = privateKey.Data(), .len = 32, .cap = 32},
                       GoSlice{.data = preSeed.Data(), .len = 32, .cap = 32},
                       GoSlice{.data = blockHash.Data(), .len = 32, .cap = 32},
                       static_cast<GoUint64>(blockNumber.Int64Value()));

  Napi::String randomness = Napi::String::New(env, ret.r0);
  if (ret.r1 != NULL) {
    Napi::TypeError::New(env, ret.r1).ThrowAsJavaScriptException();
    randomness = Napi::String::New(env, "");
  }

  delete ret.r0;
  delete ret.r1;

  return randomness;
}

Napi::String NapiKeyHash(const Napi::CallbackInfo& info) {
  auto env = info.Env();

  auto privateKey = info[0].As<Napi::Buffer<unsigned char>>();

  auto ret = KeyHash(GoSlice{.data = privateKey.Data(), .len = 32, .cap = 32});

  Napi::String keyHash = Napi::String::New(env, ret);

  delete ret;

  return keyHash;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "genVRFRandomness"),
              Napi::Function::New(env, NapiGenVRFRandomness));
  exports.Set(Napi::String::New(env, "keyHash"),
              Napi::Function::New(env, NapiKeyHash));
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
