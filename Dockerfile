from node:14.4.0
RUN mkdir /code
WORKDIR /code
ADD . /code/
RUN npm init \
    && npm install

