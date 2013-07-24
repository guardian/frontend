package frontsapi.model

case class Block(
                  id: String,
                  name: Option[String],
                  live: List[Trail],
                  draft: List[Trail],
                  areEqual: Boolean,
                  lastUpdated: String,
                  updatedBy: String,
                  updatedEmail: String
                  )

case class Trail(
                  id: String,
                  title: Option[String],
                  trailImage: Option[String],
                  linkText: Option[String]
                  )

case class UpdateList(item: String, position: Option[String], after: Option[Boolean], live: Boolean, draft: Boolean)
case class BlockAction(publish: Option[Boolean], discard: Option[Boolean])