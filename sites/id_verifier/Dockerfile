FROM ruby:2.7.1-buster

RUN apt-get update -qq && apt-get install -y nodejs postgresql-client
RUN apt-get install libsodium-dev -y
RUN apt-get install nodejs -y
RUN apt-get install libffi-dev -y
RUN apt-get install libxslt-dev -y
RUN apt-get install libxml2-dev -y
RUN apt-get install ruby-dev -y
RUN apt-get install -qq -y default-libmysqlclient-dev

RUN apt-get install -y netcat

RUN mkdir /id_verifier
COPY . /id_verifier

RUN cd /id_verifier && bundle install


ENTRYPOINT ["sh", "/id_verifier/startup.sh"]