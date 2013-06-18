package tools

import com.mongodb.casbah.{MongoURI, MongoConnection}
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

  lazy val Events = {
    val table = client("event")

    table.underlying.ensureIndex(
      Map("id" -> 1),
      Map("background" -> true, "name" -> "Event ID index", "unique" -> true)
    )

    table.underlying.ensureIndex(
      Map("content.id" -> 1),
      Map("background" -> true, "name" -> "Content ID index")
    )

    table.underlying.ensureIndex(
      Map(("parent.id", 1)),
      Map(("background", true), ("name", "Parent ID index"))
    )

    table.underlying.ensureIndex(
      Map(("startDate", 1)),
      Map(("background", true), ("name", "Start date ID index"))
    )

    table.underlying.ensureIndex(
      Map(("_rootEvent.id", 1)),
      Map(("background", true), ("name", "Ancestor ID index"))
    )

    // Write operations wait for the server to flush data to disk
    // http://api.mongodb.org/scala/casbah/2.1.2/scaladoc/com/mongodb/casbah/WriteConcern$.html
    table.setWriteConcern(com.mongodb.WriteConcern.FSYNC_SAFE)

    table
  }

  lazy val Stories = {
    val table = client("Stories")

    table.underlying.ensureIndex(
      Map("id" -> 1),
      Map("background" -> true, "name" -> "Event ID index", "unique" -> true)
    )

    table.underlying.ensureIndex(
      Map("events.content.id" -> 1),
      Map("background" -> true, "name" -> "Content ID index")
    )

    table.underlying.ensureIndex(
      Map(("createdBy.date", 1)),
      Map(("background", true), ("name", "Start date ID index"))
    )

    // Write operations wait for the server to flush data to disk
    // http://api.mongodb.org/scala/casbah/2.1.2/scaladoc/com/mongodb/casbah/WriteConcern$.html
    table.setWriteConcern(com.mongodb.WriteConcern.FSYNC_SAFE)

    table
  }

  lazy val Entities = {
    val table = client("entity")

    table.underlying.ensureIndex(
      Map("id" -> 1),
      Map("background" -> true, "name" -> "ID index", "unique" -> true)
    )
    
    // Write operations wait for the server to flush data to disk
    // http://api.mongodb.org/scala/casbah/2.1.2/scaladoc/com/mongodb/casbah/WriteConcern$.html
    table.setWriteConcern(com.mongodb.WriteConcern.FSYNC_SAFE)

    table
  }

}


