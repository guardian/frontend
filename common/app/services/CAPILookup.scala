package services

import com.gu.contentapi.client.model.v1.ItemResponse
import common.Edition
import contentapi.ContentApiClient
import model.BlockRange
import play.api.mvc.RequestHeader

import scala.concurrent.Future

sealed trait CAPIChannel
object CAPIChannel {
  case object Variant extends CAPIChannel
  case object Feast extends CAPIChannel
  case object Newsletters extends CAPIChannel
  case object Editions extends CAPIChannel
}

class CAPILookup(contentApiClient: ContentApiClient) {

  def lookup(path: String, range: Option[BlockRange], channel: Option[CAPIChannel] = None)(implicit
      request: RequestHeader,
  ): Future[ItemResponse] = {
    val edition = Edition(request)

    val capiItem = contentApiClient
      .item(path, edition)
      .showTags("all")
      .showFields("all")
      .showReferences("all")
      .showAtoms("all")
      .showSchemaOrg(true)

    val capiItemWithBlocks = range
      .map { blockRange =>
        val blocksParam = blockRange.query.map(_.mkString(",")).getOrElse("all")
        capiItem.showBlocks(blocksParam)
      }
      .getOrElse(capiItem)

    val capiItemWithChannel = channel
      .map {
        case CAPIChannel.Variant     => "variant"
        case CAPIChannel.Feast       => "feast"
        case CAPIChannel.Newsletters => "newsletters"
        case CAPIChannel.Editions    => "editions"
      }
      .map(capiItemWithBlocks.withChannelId)
      .getOrElse(capiItemWithBlocks)

    contentApiClient.getResponse(capiItemWithChannel)

  }

}
