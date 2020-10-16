package services

import com.gu.contentapi.client.model.v1.ItemResponse
import common.Edition
import contentapi.ContentApiClient
import model.BlockRange
import play.api.mvc.RequestHeader

import scala.concurrent.Future

class CAPILookup(contentApiClient: ContentApiClient) {

  def lookup(path: String, range: Option[BlockRange])(implicit request: RequestHeader): Future[ItemResponse] = {
    val edition = Edition(request)

    val capiItem = contentApiClient
      .item(path, edition)
      .showTags("all")
      .showFields("all")
      .showReferences("all")
      .showAtoms("all")

    val capiItemWithBlocks = range
      .map { blockRange =>
        val blocksParam = blockRange.query.map(_.mkString(",")).getOrElse("all")
        capiItem.showBlocks(blocksParam)
      }
      .getOrElse(capiItem)

    contentApiClient.getResponse(capiItemWithBlocks)

  }

}
