package services

import com.gu.contentapi.client.model.v1.ItemResponse
import com.gu.contentapi.client.model.ItemQuery
import common.Edition
import contentapi.ContentApiClient
import model.BlockRange
import play.api.mvc.RequestHeader

import scala.concurrent.Future

class CAPILookup(contentApiClient: ContentApiClient) {

  def lookup(
    path: String,
    range: Option[BlockRange],
    showTags: Boolean,
    showFields: Boolean,
    showReferences: Boolean,
    showAtoms: Boolean
  )(implicit request: RequestHeader): Future[ItemResponse] = {
    val edition = Edition(request)

    val capiItem = Function.chain[ItemQuery](List(
      q => if (showTags) q.showTags("all") else q,
      q => if (showFields) q.showFields("all") else q,
      q => if (showReferences) q.showReferences("all") else q,
      q => if (showAtoms) q.showAtoms("all") else q
    ))(contentApiClient.item(path, edition))

    val capiItemWithBlocks = range.map { blockRange =>
      val blocksParam = blockRange.query.map(_.mkString(",")).getOrElse("all")
      capiItem.showBlocks(blocksParam)
    }.getOrElse(capiItem)

    contentApiClient.getResponse(capiItemWithBlocks)

  }

}
