ARG SHARE_TAG
FROM <%=repository%>/alfresco-share:${SHARE_TAG}

ARG TOMCAT_DIR=/usr/local/tomcat

# Server data
ARG SERVER_NAME
ENV SERVER_NAME $SERVER_NAME

<%if (https == 'true') { %>
RUN sed -i "/<Connector port=\"8080\"/s/\/>/ scheme=\"https\" secure=\"true\" proxyName=\"${SERVER_NAME}\" proxyPort=\"443\"\/>/g" /usr/local/tomcat/conf/server.xml
<% } %>

<%if (googledocs == 'false' && acsVersion < '7' && acsVersion > '5') { %>
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

# Increase default cacheMaxSize
RUN sed -i "s|<Context>|<Context>\n<Resources cacheMaxSize=\"51200\"/> |g" $TOMCAT_DIR/conf/context.xml

# Fix for https://github.com/Alfresco/acs-community-packaging/issues/367 in Share 6.2.0
COPY web-extension/share-config-custom-dev.xml $TOMCAT_DIR/shared/classes/alfresco/web-extension/
