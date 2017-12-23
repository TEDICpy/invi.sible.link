FROM node:6
MAINTAINER Lu Pa <admin@tedic.org>

ENV DEBIAN_FRONTEND noninteractive
ENV CODE /usr/src/app

RUN apt-get update \
        && apt-get install -y \
                wget \
        && apt-get clean

WORKDIR $CODE

# Copio todo el código al contenedor
COPY . . 

# Corro el install
RUN npm install

CMD [ "npm", "storyteller" ]
