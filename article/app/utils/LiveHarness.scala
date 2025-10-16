package utils

import com.gu.contentapi.client.model.v1.{BlockElement, Blocks, ContentAtomElementFields, ElementType}
import model.ArticlePage
import model.content.InteractiveAtom
import play.api.libs.json.{Json, Reads}

case class LiveHarnessInteractiveAtom(
    id: String,
    title: String,
    css: String,
    html: String,
    js: String,
    weighting: String,
)

object LiveHarnessInteractiveAtom {
  implicit val reads: Reads[LiveHarnessInteractiveAtom] = Json.reads
}

object LiveHarness {
  def injectInteractiveAtomsIntoArticle(
      localAtoms: List[LiveHarnessInteractiveAtom],
      article: ArticlePage,
      blocks: Blocks,
  ): (ArticlePage, Blocks) = {
    val newAtomReferenceElements = localAtoms.map(localAtom => {
      BlockElement(
        `type` = ElementType.Contentatom,
        assets = Seq.empty,
        contentAtomTypeData = Some(
          ContentAtomElementFields(
            atomId = localAtom.id,
            atomType = "interactive",
            role = Some(localAtom.weighting),
            isMandatory = None,
          ),
        ),
      )
    })
    val newInteractiveAtoms = localAtoms.map(localAtom => {
      InteractiveAtom(
        id = localAtom.id,
        `type` = "interactive",
        title = localAtom.title,
        css = localAtom.css,
        html = localAtom.html,
        mainJS = Some(localAtom.js),
        docData = None,
        placeholderUrl = None,
      )
    })
    val newAtoms = article.article.content.atoms.map(_.copy(interactives = newInteractiveAtoms))
    val newArticle =
      article.copy(article = article.article.copy(content = article.article.content.copy(atoms = newAtoms)))
    val newElements =
      newAtomReferenceElements ++ blocks.body.flatMap(_.headOption.map(_.elements)).getOrElse(Seq.empty).toList
    val newBlocks = blocks.copy(body = blocks.body.map(blocks => {
      val firstBlock = blocks.headOption.map(_.copy(elements = newElements))
      val restOfBlocks = blocks.tail
      firstBlock.toList ++ restOfBlocks
    }))
    (newArticle, newBlocks)
  }
}
