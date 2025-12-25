FROM node:22.11.0-alpine

WORKDIR /garapi

COPY . .

ENV PORT=3000
ENV AUTH_BASIC=false
ENV BASIC_LOGIN=admin
ENV BASIC_PASSWORD=admin
ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_NAME=gar
ENV DB_SCHEMA=public
ENV DB_PASSWORD=postgres
ENV DB_USER=postgres

EXPOSE 3000

CMD ["node", "index.js"]