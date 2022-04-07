#!/usr/bin/env bash

mkdir -p ./data/solr-data
chown 33007 ./data/solr-data

mkdir -p ./data/postgres-data
chown 999 ./data/postgres-data

mkdir -p ./logs/postgres
chown 999 logs/postgres
