FROM node:22.11.0-alpine

WORKDIR /garservice

COPY . .

ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_NAME=gar
ENV DB_ADMIN_NAME=postgres
ENV DB_SCHEMA=public
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
ENV DATA_SOURCE_PATH=/garservice/data
ENV DATA_LOAD_MODE=service
ENV DATA_HANDLE_MODE=minimal
ENV RUN_INTERVAL_DAYS=10
ENV REGIONS=
ENV BATCH_SIZE=3000
ENV MAX_CONCURRENT_BATCHES=3
ENV MVR_WORK_MEM=4
ENV MVR_MAINTENANCE_WORK_MEM=64
ENV LOG_TO_FILE=true
ENV MAX_SIZE_LOG_FILE=2
ENV LOGS_PATH=/garservice/logs

RUN mkdir -p /garservice/data /garservice/logs

CMD ["node", "index.js"]