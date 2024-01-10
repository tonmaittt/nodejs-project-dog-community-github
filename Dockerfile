
# # FROM node:latest

# # WORKDIR /usr/src/app

# # COPY package.json /usr/src/app/

# # RUN npm install

# # COPY . .

# # EXPOSE 3000

# # CMD ["npm", "start"]


# FROM node:latest

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD ["npm", "start"]