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
