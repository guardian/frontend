package tools

import com.mongodb.casbah.{ MongoURI, MongoConnection }
import com.mongodb.casbah.Imports._
import conf.Configuration

object Mongo {

  private lazy val connectionUri = Configuration.mongo.connection

  private lazy val client = {
    val uri = MongoURI(connectionUri)
    val mongo = MongoConnection(uri)
    val db = mongo(uri.database.get)
    db.authenticate(uri.username.get, uri.password.get.map(_.toString).mkString)
    db
  }

  lazy val Events = client("event")

}