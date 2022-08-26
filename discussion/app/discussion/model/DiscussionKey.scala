package discussion.model

import play.api.mvc.PathBindable

case class DiscussionKey(val keyAsString: String) {
  require(keyAsString != null && keyAsString.matches("""/?p/\w+"""), "Invalid discussion key")

  override def toString(): String = keyAsString
}

// Used by the PlayFramework to bind DiscussionKey in the routes file
object DiscussionKey {
  implicit def pathBinder(implicit stringBinder: PathBindable[String]): PathBindable[DiscussionKey] {
    def bind(key: String, value: String): Either[String, DiscussionKey]

    def unbind(key: String, discussionKey: DiscussionKey): String
  } =
    new PathBindable[DiscussionKey] {
      override def bind(key: String, value: String): Either[String, DiscussionKey] = {
        for {
          keyAsString <- stringBinder.bind(key, value)
        } yield DiscussionKey(keyAsString)
      }

      override def unbind(key: String, discussionKey: DiscussionKey): String = {
        stringBinder.unbind(key, discussionKey.keyAsString)
      }
    }
}
