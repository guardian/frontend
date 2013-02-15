package tools

import com.mongodb.casbah.{ MongoURI, MongoConnection }
import com.mongodb.casbah.Imports._
import com.novus.salat._
import conf.Configuration

import org.joda.time.DateTime
import com.mongodb.casbah.commons.conversions.scala.{ RegisterJodaTimeConversionHelpers, RegisterConversionHelpers }

object Mongo {

  RegisterConversionHelpers()
  RegisterJodaTimeConversionHelpers()

  private lazy val connectionUri = Configuration.mongo.connection

  private lazy val client = {
    val uri = MongoURI(connectionUri)
    val mongo = MongoConnection(uri)
    val db = mongo(uri.database.get)
    db.authenticate(uri.username.get, uri.password.get.map(_.toString).mkString)
    db
  }

  lazy val Stories = client("Stories")

}