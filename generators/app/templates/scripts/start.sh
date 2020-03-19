#!/usr/bin/env bash

show_help() {
  echo "Usage: ./start.sh"
  echo ""
  echo "-d or --down delete all container"
  echo "-wp or --windows-path convert to Windows path"
  echo "-hi or --host-ip set the host ip"
  echo "-hp or --host-port set the host port. Default 8080"
  echo "-wt or --wait-time wait for backend in s. Default 500 s"
  echo "-h or --help"
}

set_keycloak(){
  KEYCLOAK="true"
}

set_windows_path(){
  export COMPOSE_CONVERT_WINDOWS_PATHS=1
}

down(){
  docker-compose down
  exit 0
}

set_host_ip(){
  SET_HOST_IP=$1
}

set_host_port(){
  HOST_PORT=$1
}

set_wait_time(){
  WAIT_TIME=$1
}

# Defaults
WAIT_TIME=500
SET_HOST_IP=""
HOST_PORT="<%=port%>"

while [[ $1 == -* ]]; do
  case "$1" in
    -h|--help|-\?) show_help; exit 0;;
    -wp|--windows-path)  set_windows_path; shift;;
    -d|--down)  down; shift;;
    -wt|--wait-time)  set_wait_time $2; shift 2;;
    -hi|--host-ip)  set_host_ip $2; shift 2;;
    -hp|--host-port)  set_host_port $2; shift 2;;
    -*) echo "invalid option: $1" 1>&2; show_help; exit 1;;
  esac
done

if [ -n "${SET_HOST_IP}" ];then
  HOST_IP=${SET_HOST_IP}
else
  echo "No HOST_IP set, try to figure out on its own ..."
  HOST_IP=$(ifconfig | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v 127.0.0.1 | awk '{ print $2 }' | cut -f2 -d: | head -n1)
fi
export HOST_IP=${HOST_IP}
echo "HOST_IP: ${HOST_IP}"

echo "Start docker compose"
docker-compose up -d --build

if [[ $WAIT == "true" ]]; then
  echo "Waiting for alfresco to boot ..."
  WAIT_TIME=$(${WAIT_TIME} * 1000)
  node_modules/wait-on/bin/wait-on "http://${HOST_IP}:${HOST_PORT}/alfresco/" -t "${WAIT_TIME}" -i 10000 -v
  if [ $? == 1 ]; then
    echo "Waiting failed -> exit 1"
    exit 1
  fi
fi
