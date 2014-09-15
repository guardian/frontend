package database

import conf.Configuration._
import java.sql.{Connection, DriverManager}

trait db {

  def getConnectionByUrl(url: String) = DriverManager.getConnection(url)

  def getConnection : Connection

  def withConnection[A]()(block: Connection => A): A = {
    val connection = getConnection
    try {
      block(connection)
    } finally {
      connection.close()
    }
  }
}

trait SentryDb extends db {

  Class.forName("org.postgresql.Driver").newInstance

  def getConnection = getConnectionByUrl("%s?user=%s&password=%s".format(db.sentry_db_url, db.sentry_db_username, db.sentry_db_password))

}
