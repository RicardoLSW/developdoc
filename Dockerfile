FROM nginx
COPY nginx/default.conf /etc/nginx/conf.d/
RUN rm -rf /usr/share/nginx/html/*
COPY /docs/.vuepress/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
