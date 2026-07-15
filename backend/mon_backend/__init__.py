# Force PyMySQL as MySQLdb (plus simple sur Render / hébergeurs PaaS)
import pymysql

pymysql.install_as_MySQLdb()
