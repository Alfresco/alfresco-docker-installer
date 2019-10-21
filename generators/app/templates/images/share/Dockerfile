ARG SHARE_TAG
FROM alfresco/alfresco-share:${SHARE_TAG}

ARG TOMCAT_DIR=/usr/local/tomcat

USER root

<%if (https == 'true') { %>
RUN sed -i '/Connector port="8080"/a scheme="https" secure="true"' /usr/local/tomcat/conf/server.xml && \
    sed -i '/Connector port="8080"/a proxyName="<%=serverName%>" proxyPort="<%=port%>"' /usr/local/tomcat/conf/server.xml
<% } %>

# Install modules and addons
RUN mkdir -p $TOMCAT_DIR/amps
COPY modules/amps $TOMCAT_DIR/amps
COPY modules/jars $TOMCAT_DIR/webapps/share/WEB-INF/lib

RUN java -jar $TOMCAT_DIR/alfresco-mmt/alfresco-mmt*.jar install \
    $TOMCAT_DIR/amps $TOMCAT_DIR/webapps/share -directory -nobackup -force