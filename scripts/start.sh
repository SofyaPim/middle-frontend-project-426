#!/bin/sh
set -eu

npm run db:migrate:deploy --workspace=@pc-shop/backend
npm run db:seed --workspace=@pc-shop/backend
exec npm run start --workspace=@pc-shop/backend
