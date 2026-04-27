#!/bin/bash

echo "Gerando módulos do projeto Doce Encanto..."

# Users Module
nest g module modules/users --no-spec
nest g service modules/users --no-spec
nest g controller modules/users --no-spec

# Products Module
nest g module modules/products --no-spec
nest g service modules/products --no-spec
nest g controller modules/products --no-spec

# Categories Module
nest g module modules/categories --no-spec
nest g service modules/categories --no-spec
nest g controller modules/categories --no-spec

# Orders Module
nest g module modules/orders --no-spec
nest g service modules/orders --no-spec
nest g controller modules/orders --no-spec

# Reviews Module
nest g module modules/reviews --no-spec
nest g service modules/reviews --no-spec
nest g controller modules/reviews --no-spec

# Addresses Module
nest g module modules/addresses --no-spec
nest g service modules/addresses --no-spec
nest g controller modules/addresses --no-spec

# Discounts Module
nest g module modules/discounts --no-spec
nest g service modules/discounts --no-spec
nest g controller modules/discounts --no-spec

# Wishlists Module
nest g module modules/wishlists --no-spec
nest g service modules/wishlists --no-spec
nest g controller modules/wishlists --no-spec

# Permissions Module
nest g module modules/permissions --no-spec
nest g service modules/permissions --no-spec
nest g controller modules/permissions --no-spec

# Reports Module
nest g module modules/reports --no-spec
nest g service modules/reports --no-spec
nest g controller modules/reports --no-spec

echo "Módulos gerados com sucesso!"
