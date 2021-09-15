ARG ALFRESCO_TAG
FROM alfresco/alfresco-content-repository-community:${ALFRESCO_TAG}

ARG TOMCAT_DIR=/usr/local/tomcat

USER root

# Install modules and addons
RUN mkdir -p $TOMCAT_DIR/amps
COPY modules/amps $TOMCAT_DIR/amps
COPY modules/jars $TOMCAT_DIR/webapps/alfresco/WEB-INF/lib

RUN java -jar $TOMCAT_DIR/alfresco-mmt/alfresco-mmt*.jar install \
    $TOMCAT_DIR/amps $TOMCAT_DIR/webapps/alfresco -directory -nobackup -force

<%if (acsVersion < '7') { %>
# Install api-explorer webapp for REST API for ACS 6.x versions
ARG API_EXPLORER_TAG
ENV API_EXPLORER_TAG $API_EXPLORER_TAG
RUN yum -y update && \
 yum -y install wget && \
 yum clean all && \
 set -x \
    && wget https://artifacts.alfresco.com/nexus/service/local/repositories/releases/content/org/alfresco/api-explorer/${API_EXPLORER_TAG}/api-explorer-${API_EXPLORER_TAG}.war \
    -O /usr/local/tomcat/webapps/api-explorer.war
<% } %>

# DATABASE
ARG DB
ENV DB $DB

# Install mysql JDBC driver
RUN if [ "$DB" == "mariadb" ] ; then \
    set -x \
        && yum install -y wget \
        && yum clean all \
        && wget -P /tmp/ http://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-java-8.0.13.tar.gz \
        && tar xvf /tmp/mysql-connector-java-8.0.13.tar.gz -C /tmp/ \
        && cp /tmp/mysql-connector-java-8.0.13/mysql-connector-java-8.0.13.jar $TOMCAT_DIR/lib/ \
        && rm -rf /tmp/mysql-connector-java-8.0.13.tar.gz /tmp/mysql-connector-java-8.0.13; \
fi

<% if (ocr == 'true') { %>
# SSH keys for ocrmypdf
COPY ssh/ /root/.ssh/

# Install OCR
COPY bin/ /opt/alfresco/bin/

# Configure SSH Client
RUN set -x && \
    chmod +x /opt/alfresco/bin/ocrmypdf.sh && \
    # Configure ssh
    yum install -y openssh-clients && \
    echo "StrictHostKeyChecking no" >> /etc/ssh/ssh_config && \
    # Alfresco Image is using POSIX as Locale (!)
    sed -i '/^\s*SendEnv/ d' /etc/ssh/ssh_config && \
    chmod 600 /root/.ssh/id_rsa
<% } %>

<% if (ftp == 'true') { %>
EXPOSE 2121 2433 2434
<% } %>
