FROM mysql:8.0

# 환경 변수 설정
ENV MYSQL_DATABASE=logistics_db
ENV MYSQL_USER=logistics_user
ENV MYSQL_PASSWORD=password
ENV MYSQL_ROOT_PASSWORD=rootpassword

# 초기화 SQL 스크립트 복사
COPY ./init.sql /docker-entrypoint-initdb.d/

# MySQL 설정 파일 복사
COPY ./my.cnf /etc/mysql/conf.d/

# 포트 노출
EXPOSE 3306