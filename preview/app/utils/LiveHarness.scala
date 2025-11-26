package utils

import com.gu.contentapi.client.model.v1.{BlockElement, Blocks, ContentAtomElementFields, ElementType}
import model.{ArticlePage, Content, InteractivePage}
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
  def injectInteractiveAtomsIntoPage(
      localAtoms: List[LiveHarnessInteractiveAtom],
      article: ArticlePage,
      blocks: Blocks,
  ): (ArticlePage, Blocks) = {
    val (updatedContent, updatedBlocks) =
      addLocalAtomsToParent(article.article.content, blocks, localAtoms)
    val updatedPage = article.copy(article = article.article.copy(content = updatedContent))
    (updatedPage, updatedBlocks)
  }
  def injectInteractiveAtomsIntoPage(
      localAtoms: List[LiveHarnessInteractiveAtom],
      article: InteractivePage,
      blocks: Blocks,
  ): (InteractivePage, Blocks) = {
    val (updatedContent, updatedBlocks) =
      addLocalAtomsToParent(article.interactive.content, blocks, localAtoms)
    val updatedPage = article.copy(interactive = article.interactive.copy(content = updatedContent))
    (updatedPage, updatedBlocks)
  }
  private def turnLocalAtomsIntoAtomBlocksAndElements(
      localAtoms: List[LiveHarnessInteractiveAtom],
  ): (List[InteractiveAtom], List[BlockElement]) = {
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
    val newAtomReferenceBlockElements = localAtoms.map(localAtom => {
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
    (newInteractiveAtoms, newAtomReferenceBlockElements)
  }
  private def addLocalAtomsToParent(
      content: Content,
      blocks: Blocks,
      localAtoms: List[LiveHarnessInteractiveAtom],
  ): (Content, Blocks) = {
    val (newAtoms, newBlocks) = turnLocalAtomsIntoAtomBlocksAndElements(localAtoms)
    val updatedAtoms = content.atoms.map(_.copy(interactives = newAtoms))
    val updatedContent = content.copy(atoms = updatedAtoms)
    val newElements = newBlocks ++ blocks.body.flatMap(_.headOption.map(_.elements)).getOrElse(Seq.empty).toList
    val updatedBlocks = blocks.copy(body = blocks.body.map(blocks => {
      val firstBlock = blocks.headOption.map(_.copy(elements = newElements))
      val restOfBlocks = blocks.tail
      firstBlock.toList ++ restOfBlocks
    }))
    (updatedContent, updatedBlocks)
  }
}
