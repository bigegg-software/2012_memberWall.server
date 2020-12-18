# FROM nginx
# COPY .  /usr/share/nginx/html
FROM node:10

WORKDIR /parse-server
COPY cloud cloud
COPY *.js ./
COPY package*.json ./
RUN npm config set registry https://registry.npm.taobao.org && npm install --production
#RUN registry=http://registry.npm.taobao.org npm install --production

RUN mkdir -p logs && chown -R node: logs

USER node
EXPOSE 1337

ENTRYPOINT ["npm", "run", "start"]
