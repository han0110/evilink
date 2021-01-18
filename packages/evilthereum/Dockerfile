ARG GOLANG_IMAGE_TAG=1.15
ARG NODE_IMAGE_TAG=14

# Binary dependency stage
FROM golang:${GOLANG_IMAGE_TAG} AS bin-deps

WORKDIR /workspace/packages/chainlink-vrf/go

COPY packs/packages/chainlink-vrf/go /workspace/packages/chainlink-vrf/go
RUN make build

# Dependency stage
FROM node:${NODE_IMAGE_TAG} AS deps

WORKDIR /workspace

RUN apt-get install git openssh-client python make g++

COPY manifests ./

COPY packs/packages/chainlink-vrf/binding.gyp /workspace/packages/chainlink-vrf/binding.gyp
COPY packs/packages/chainlink-vrf/addon.cc /workspace/packages/chainlink-vrf/addon.cc
COPY --from=bin-deps /workspace/packages/chainlink-vrf/go/build /workspace/packages/chainlink-vrf/go/build

RUN yarn workspaces focus @evilink/evilthereum --production
RUN rm -rf .yarn/cache

COPY packs /workspace/

# Final stage
FROM node:${NODE_IMAGE_TAG}

WORKDIR /workspace/packages/evilthereum

COPY --from=deps /workspace /workspace
COPY packs /workspace/
COPY --from=deps /workspace/packages/chainlink-vrf/build /workspace/packages/chainlink-vrf/build

ENV NODE_ENV=production
ENV NODE_PATH=../../node_modules

ENTRYPOINT ["node"]
CMD ["./lib/index.js", "serve"]
