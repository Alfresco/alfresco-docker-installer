ARG ALFRESCO_TAG
FROM alfresco/alfresco-content-repository-community:${ALFRESCO_TAG}

ARG TOMCAT_DIR=/usr/local/tomcat
ARG IMAGEUSERNAME=alfresco

# default user is alfresco (added on the base image alfresco/alfresco-content-repository-community)
# change to root user to be able to install the addons and packages
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
        && wget -P /tmp/ https://repo1.maven.org/maven2/org/mariadb/jdbc/mariadb-java-client/2.7.4/mariadb-java-client-2.7.4.jar \
        && cp /tmp/mariadb-java-client-2.7.4.jar $TOMCAT_DIR/lib/ \
        && rm -rf /tmp/mariadb-java-client-2.7.4.jar; \
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

# COMMS
ARG SOLR_COMMS
ENV SOLR_COMMS $SOLR_COMMS

# SSL
ARG TRUSTSTORE_TYPE
ARG TRUSTSTORE_PASS
ARG KEYSTORE_TYPE
ARG KEYSTORE_PASS

ENV TRUSTSTORE_TYPE=$TRUSTSTORE_TYPE \
    TRUSTSTORE_PASS=$TRUSTSTORE_PASS \
    KEYSTORE_TYPE=$KEYSTORE_TYPE \
    KEYSTORE_PASS=$KEYSTORE_PASS

# Enable SSL by adding the proper Connector to server.xml
RUN if [ "$SOLR_COMMS" == "https" ] ; then \
      sed -i "s/\
[[:space:]]\+<\/Engine>/\n\
        <\/Engine>\n\
        <Connector port=\"8443\" protocol=\"HTTP\/1.1\"\n\
            connectionTimeout=\"20000\"\n\
            SSLEnabled=\"true\" maxThreads=\"150\" scheme=\"https\" clientAuth=\"want\" sslProtocol=\"TLS\" sslEnabledProtocols=\"TLSv1.2\"\n\
            keystoreFile=\"\/usr\/local\/tomcat\/keystore\/ssl.keystore\"\n\
            keystorePass=\"${KEYSTORE_PASS}\" keystoreType=\"${KEYSTORE_TYPE}\" secure=\"true\"\n\
            truststoreFile=\"\/usr\/local\/tomcat\/keystore\/ssl.truststore\"\n\
            truststorePass=\"${TRUSTSTORE_PASS}\" truststoreType=\"${TRUSTSTORE_TYPE}\">\n\
        <\/Connector>/g" ${TOMCAT_DIR}/conf/server.xml; \
    fi

<% if (ftp == 'true') { %>
EXPOSE 2121 2433 2434
<% } %>

<%if (acsVersion > '6.1') { %>
# Restore original user
RUN chown -R ${IMAGEUSERNAME} $TOMCAT_DIR
USER ${IMAGEUSERNAME}
<% } %>
