FROM gitpod/workspace-full:latest

USER root
RUN bash -c ". .nvm/nvm.sh \
        && nvm install 12 \
        && nvm alias default 12 \
        && nvm use 12 \
        && npm install -g yarn gulp eslint"
