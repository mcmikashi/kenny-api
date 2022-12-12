# Build image
# -----------
FROM node:lts-alpine as BUILD_IMAGE

# Don't run Node.js apps as root
USER node
RUN mkdir -p /home/node/app && chown node:node /home/node/app

# Container app directory
WORKDIR /home/node/app

# Install Foal CLI
USER root
RUN npm install -g @foal/cli
USER node

# Install app dependencies
COPY --chown=node:node package*.json ./
RUN npm clean-install

# Copy files from current directory to Docker workdir
COPY --chown=node:node . .

# Build FoalTS app
RUN npm run build


# Production image
# ----------------
FROM node:lts-alpine

# Env variables
ENV NODE_ENV=production

# Expose container port
EXPOSE 3001

# Container app directory
WORKDIR /home/node/app

# Install app dependencies
COPY --chown=node:node package*.json ./
RUN npm clean-install --omit=dev

# Copy build source
COPY --chown=node:node --from=BUILD_IMAGE /home/node/app/public ./public
COPY --chown=node:node --from=BUILD_IMAGE /home/node/app/config ./config
COPY --chown=node:node --from=BUILD_IMAGE /home/node/app/build ./build
COPY --chown=node:node --from=BUILD_IMAGE /home/node/app/.env .

# Let's run the app!
CMD ["node" ,"build/index.js"]
