#!/bin/bash

cd /var/www/www-root/data/www/royaltransfer.org

npm install

npm run build

pm2 restart royaltransfer

echo "Сайт успешно обновлен!"
