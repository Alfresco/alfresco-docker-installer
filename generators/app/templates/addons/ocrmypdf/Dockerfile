FROM jbarlow83/ocrmypdf:latest
USER root

RUN apt-get update && apt-get install -y openssh-server
RUN mkdir /var/run/sshd
RUN echo 'root:screencast' | chpasswd
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

COPY assets/ssh/id_rsa.pub /root/.ssh/id_rsa.pub
COPY assets/ocr.sh /usr/bin/ocr.sh
RUN cat /root/.ssh/id_rsa.pub >> /root/.ssh/authorized_keys \
 && chmod 0600 /root/.ssh/authorized_keys \
 && chmod +x /usr/bin/ocr.sh

EXPOSE 22
ENTRYPOINT ["/usr/sbin/sshd", "-D"]