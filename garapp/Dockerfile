FROM nginx:alpine

WORKDIR /garapp

COPY dist /garapp

RUN echo 'server { \
    listen 3001; \
    server_name localhost; \
    root /garapp; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]