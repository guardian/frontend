package frontsapi.model

import org.joda.time.DateTime

case class Edition(
                    id: String,
                    sections: List[Section]
                    )

case class Section(
                    id: Option[String],
                    blocks: List[Block]
                    )

case class Block(
                  id: String,
                  name: Option[String],
                  trails: List[Trail],
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

case class UpdateList(item: String, position: Option[String], after: Option[Boolean])