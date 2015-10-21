FROM node:4.2.1-wheezy

RUN apt-get update -y && apt-get install postgresql-client -y
ADD application /application
WORKDIR /application
EXPOSE 80
CMD npm start
