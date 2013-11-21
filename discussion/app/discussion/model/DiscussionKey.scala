package discussion.model

import play.api.mvc.PathBindable

case class DiscussionKey(val keyAsString: String) {
  require(keyAsString != null && keyAsString.matches("/?p/[\\d\\w]*"), "Invalid discussion key")

  override def toString(): String = keyAsString
}

// For binding to DiscussionKey in the routes file
object DiscussionKey {
  implicit def pathBinder(implicit stringBinder: PathBindable[String]) = new PathBindable[DiscussionKey] {
    override def bind(key: String, value: String): Either[String, DiscussionKey] = {
      for {
        keyAsString <- stringBinder.bind(key, value).right
      } yield DiscussionKey(keyAsString)
    }

    override def unbind(key: String, discussionKey: DiscussionKey): String = {
      stringBinder.unbind(key, discussionKey.keyAsString)
    }
  }
}