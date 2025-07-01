FROM nginx:alpine

# Copie la config nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copie les fichiers du projet dans le répertoire html de nginx
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
