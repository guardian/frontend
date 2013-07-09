package frontsapi.model

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
                  trails: List[Trail]
                  //lastUpdated: DateTime = DateTime.now
                  )

case class Trail(
                  id: String,
                  title: Option[String],
                  trailImage: Option[String],
                  linkText: Option[String]
                  )