ARG NODE_IMAGE_TAG=14

# Dependency stage
FROM node:${NODE_IMAGE_TAG}-alpine AS deps

WORKDIR /workspace

RUN apk add --update git openssh-client

COPY manifests ./

RUN yarn workspaces focus @evilink/playground --production
RUN rm -rf .yarn/cache

# Final stage
FROM gcr.io/distroless/nodejs:${NODE_IMAGE_TAG}

WORKDIR /workspace/packages/playground

COPY --from=deps /workspace /workspace/
COPY packs /workspace/

ENV NODE_ENV=production
ENV NODE_PATH=../../node_modules

CMD ["../../node_modules/.bin/next", "start"]
