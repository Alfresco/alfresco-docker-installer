ARG SHARE_TAG
FROM alfresco/alfresco-share:${SHARE_TAG}

ARG TOMCAT_DIR=/usr/local/tomcat

# Server data
ARG SERVER_NAME

<%if (https == 'true') { %>
RUN sed -i '/Connector port="8080"/a scheme="https" secure="true"' /usr/local/tomcat/conf/server.xml && \
    sed -i "/Connector port=\"8080\"/a proxyName=\"${SERVER_NAME}\" proxyPort=\"<%=port%>\"" /usr/local/tomcat/conf/server.xml
<% } %>

<%if (googledocs == 'false' && acsVersion < '7') { %>
# Uninstall manually Share GoogleDocs module
RUN rm $TOMCAT_DIR/webapps/share/WEB-INF/lib/alfresco-googledocs-share-community-*.jar && \
    rm $TOMCAT_DIR/webapps/share/WEB-INF/classes/alfresco/web-extension/custom-slingshot-googledocs-context.xml && \
    rm $TOMCAT_DIR/webapps/share/WEB-INF/classes/alfresco/messages/googledocs_* && \
    rm -rf $TOMCAT_DIR/webapps/share/WEB-INF/classes/alfresco/site-webscripts/org/alfresco/modules/googledocs && \
    rm -rf $TOMCAT_DIR/webapps/share/WEB-INF/classes/alfresco/module/org.alfresco.integrations.share.google.docs
<% } %>

# Install modules and addons
RUN mkdir -p $TOMCAT_DIR/amps
COPY modules/amps $TOMCAT_DIR/amps
COPY modules/jars $TOMCAT_DIR/webapps/share/WEB-INF/lib

RUN java -jar $TOMCAT_DIR/alfresco-mmt/alfresco-mmt*.jar install \
    $TOMCAT_DIR/amps $TOMCAT_DIR/webapps/share -directory -nobackup -force

# Fix for https://github.com/Alfresco/acs-community-packaging/issues/367 in Share 6.2.0
COPY web-extension/share-config-custom-dev.xml $TOMCAT_DIR/shared/classes/alfresco/web-extension/
