package liveblogs

import com.gu.openplatform.contentapi.model.Content
import com.gu.util.liveblogs.{BlockToText, Block => ParsedBlock, Parser}
import org.joda.time.DateTime
import play.api.libs.json.Json

object Block {
  implicit val jsonWrites = Json.writes[Block]
}

case class Block(
  articleId: String,
  blockId: String,
  body: String,
  posted: DateTime
)

object BlocksResponse {
  implicit val jsonWrites = Json.writes[BlocksResponse]

  def fromContent(items: List[Content]): BlocksResponse = {
    BlocksResponse((items map { item =>
      for {
        body <- item.safeFields.get("body")
        _ <- item.safeFields.get("liveBloggingNow").filter(_ == "true")
        (latestBlock, latestBlockText) <- Parser.parse(body) collectFirst {
          case block @ ParsedBlock(_, _, _, _, BlockToText(text), _) if text.trim.nonEmpty => (block, text)
        }
      } yield Block(
        item.id,
        latestBlock.id,
        latestBlockText,
        latestBlock.lastUpdatedDateTime.getOrElse(latestBlock.publishedDateTime)
      )
    }).flatten)
  }
}

case class BlocksResponse(
  latestBlocks: Seq[Block]
)

