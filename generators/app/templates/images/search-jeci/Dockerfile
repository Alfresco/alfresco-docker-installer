# syntax=docker/dockerfile:1
#
# Multi-stage build for the Jeci community fork of Alfresco Search Services
# (vanilla Apache Solr 9 / Java 17, with the indexing trackers externalized).
#
# This image compiles the fork FROM SOURCE inside the builder stage, so users of
# alfresco-docker-installer need only Docker — no local JDK, Maven, or manual clone.
# `docker compose up` clones + builds + runs everything.
#
# Two runtime images are produced from one shared builder, selected with --target:
#   * solr     -> Solr 9 query + index-storage node
#   * trackers -> standalone Spring Boot indexing trackers
#
# NOTE: This Dockerfile is intended to be contributed back to the Jeci project
# (https://github.com/jecicorp/AlfrescoSearchServices). Once it lives in that repo,
# the builder stage can drop the `git clone` and use `COPY . .` against the repo
# as build context instead.

# ---------------------------------------------------------------------------
# Builder: clone the fork and compile with Java 17 (Temurin)
# ---------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-17 AS builder

# Override to build a different fork/branch/commit without editing this file.
ARG JECI_REPO=https://github.com/jecicorp/AlfrescoSearchServices.git
ARG JECI_REF=develop

RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 --branch "${JECI_REF}" "${JECI_REPO}" /src
WORKDIR /src

# Build the Solr distribution ZIP and the trackers Spring Boot JAR in one pass.
# The BuildKit cache mount keeps the Maven repo warm across rebuilds.
#
# The build references an internal artifact (org.alfresco:alfresco-license-headers)
# that normally comes from Jeci's private Nexus. Reconstruct it from the in-repo
# license-headers/ content and install it into the SAME cached .m2 the build uses
# (a separate RUN would write under the cache mount and be shadowed). The license
# goals themselves are skipped (they only stamp/check headers, not the binaries).
RUN --mount=type=cache,target=/root/.m2 \
    (cd license-headers && jar cf /tmp/alfresco-license-headers-1.0.jar .) \
    && mvn -B -q org.apache.maven.plugins:maven-install-plugin:3.1.1:install-file \
         -Dfile=/tmp/alfresco-license-headers-1.0.jar \
         -DgroupId=org.alfresco -DartifactId=alfresco-license-headers \
         -Dversion=1.0 -Dpackaging=jar \
    && mvn -B -DskipTests \
        -Dlicense.skipUpdateLicense=true -Dlicense.skipAddThirdParty=true \
        clean install \
        -pl search-services/alfresco-solrclient-lib,search-services/alfresco-search,search-services/packaging,search-services/alfresco-indexing-trackers -am

# Collect the distribution ZIP at a stable path for the runtime stage.
RUN mkdir -p /dist && cp search-services/packaging/target/alfresco-search-services-*.zip /dist/

# ---------------------------------------------------------------------------
# Runtime: Solr 9 (query serving + index storage)
# ---------------------------------------------------------------------------
FROM alfresco/alfresco-base-java:jre17-rockylinux9 AS solr

ENV DIST_DIR=/opt/alfresco-search-services
ENV SOLR_DATA_DIR_ROOT=$DIST_DIR/data
ENV SOLR_SOLR_MODEL_DIR=$DIST_DIR/data/alfrescoModels
ENV LANG=C.UTF-8

ARG USERNAME=solr
ARG USERID=33007

COPY --from=builder /dist/ /tmp/dist/

RUN set -x \
    && useradd -c "Alfresco ${USERNAME}" -M -s /bin/bash -u ${USERID} -o ${USERNAME} \
    && yum install -y unzip lsof ca-certificates procps-ng wget \
    && yum clean all \
    && unzip /tmp/dist/*.zip -d /opt/ \
    && rm -rf /tmp/dist \
    && mkdir -p $DIST_DIR/data \
    && mv $DIST_DIR/solrhome/alfrescoModels $DIST_DIR/data/ \
    && chown -R ${USERNAME}:${USERNAME} $DIST_DIR \
    && echo '#Docker Setup' >> $DIST_DIR/solr.in.sh \
    && echo 'SOLR_OPTS="$SOLR_OPTS -Dsolr.data.dir.root=$SOLR_DATA_DIR_ROOT -Dsolr.solr.model.dir=$SOLR_SOLR_MODEL_DIR -Dsolr.allowPaths=$DIST_DIR/solrhome"' >> $DIST_DIR/solr.in.sh \
    && echo '# Solr 9 ships ICU analysis (used by the Alfresco schema) in the analysis-extras module' >> $DIST_DIR/solr.in.sh \
    && echo 'SOLR_MODULES=analysis-extras' >> $DIST_DIR/solr.in.sh \
    && echo '# Solr 9 binds to 127.0.0.1 by default; bind to all interfaces so the container is reachable' >> $DIST_DIR/solr.in.sh \
    && echo 'SOLR_JETTY_HOST=0.0.0.0' >> $DIST_DIR/solr.in.sh \
    && echo '# Solr 9 enables the Java SecurityManager by default; the Alfresco plugins need unrestricted access' >> $DIST_DIR/solr.in.sh \
    && echo 'SOLR_SECURITY_MANAGER_ENABLED=false' >> $DIST_DIR/solr.in.sh

# Startup helpers (not part of the distribution ZIP; taken from the source tree).
COPY --from=builder /src/search-services/packaging/src/docker/search_config_setup.sh $DIST_DIR/solr/bin/
COPY --from=builder /src/search-services/packaging/src/docker/solr-init-core.sh $DIST_DIR/
RUN chmod +x $DIST_DIR/solr/bin/search_config_setup.sh $DIST_DIR/solr-init-core.sh \
    && (mv $DIST_DIR/licenses /licenses || true)

WORKDIR $DIST_DIR

VOLUME $DIST_DIR/data
VOLUME $DIST_DIR/solrhome
VOLUME $DIST_DIR/keystores

EXPOSE 8983
USER ${USERNAME}
CMD $DIST_DIR/solr/bin/search_config_setup.sh "$DIST_DIR/solr/bin/solr start -f"

# ---------------------------------------------------------------------------
# Runtime: standalone indexing trackers (Spring Boot)
# ---------------------------------------------------------------------------
# Use the multi-arch Ubuntu-based JRE (the -alpine tag has no arm64 manifest,
# which breaks the build on Apple Silicon / arm64 hosts).
FROM eclipse-temurin:17-jre AS trackers

LABEL org.opencontainers.image.title="Alfresco Indexing Trackers (Jeci fork)"
LABEL org.opencontainers.image.description="Polls the Alfresco Repository and indexes into Solr 9 via SolrJ"

RUN groupadd -g 33007 trackers && useradd -u 33007 -g trackers -M -s /usr/sbin/nologin trackers

WORKDIR /app
COPY --from=builder /src/search-services/alfresco-indexing-trackers/target/alfresco-indexing-trackers-*.jar /app/alfresco-indexing-trackers.jar
RUN mkdir -p /opt/solr/data/alfrescoModels && chown -R trackers:trackers /app /opt/solr/data

USER trackers
EXPOSE 8085

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q --spider http://localhost:8085/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/alfresco-indexing-trackers.jar"]
