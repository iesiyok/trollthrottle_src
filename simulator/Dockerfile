
FROM node:13.12.0-stretch-slim


RUN apt-get update -qq  
RUN apt-get install libsodium-dev -y
RUN apt-get install nodejs -y
RUN apt-get install libffi-dev -y
RUN apt-get install libxslt-dev -y
RUN apt-get install libxml2-dev -y
RUN apt-get install ruby-dev -y
RUN apt-get install -qq -y default-libmysqlclient-dev

RUN apt-get install -y netcat

# Create app directory
RUN mkdir /simulator

COPY . /simulator


RUN cd /simulator && npm install


ENTRYPOINT ["sh", "/simulator/startup.sh"]