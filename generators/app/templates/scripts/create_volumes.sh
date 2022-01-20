#!/usr/bin/env bash

mkdir ./data
mkdir ./data/solr-data
chown 33007 ./data/solr-data

mkdir ./data/postgres-data
chown 999 ./data/postgres-data

mkdir ./logs
mkdir logs/postgres
chown 999 logs/postgres
