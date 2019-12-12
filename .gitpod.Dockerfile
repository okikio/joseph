FROM gitpod/workspace-full
## bash -c ". .nvm/nvm.sh \ && 
USER root
RUN nvm install 12 \
    && nvm alias default 12 \
    && nvm use 12 \
    && npm install -g yarn gulp eslint
