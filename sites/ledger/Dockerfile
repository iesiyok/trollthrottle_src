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

RUN mkdir /ledger
COPY . /ledger

RUN cd /ledger && bundle install


ENTRYPOINT ["sh", "/ledger/startup.sh"]