package utils

import com.gu.contentapi.client.model.v1.{BlockElement, ContentAtomElementFields, ElementType}
import model.content.InteractiveAtom
import model.meta.BlocksOn
import model.{ArticlePage, Content, ContentPage, InteractivePage}
import play.api.libs.json.{Json, Reads}

case class LiveHarnessInteractiveAtom(
    id: String,
    title: String,
    css: String,
    html: String,
    js: String,
    weighting: String,
) {
  val atom = InteractiveAtom(
    id = id,
    `type` = "interactive",
    title = title,
    css = css,
    html = html,
    mainJS = Some(js),
    docData = None,
    placeholderUrl = None,
  )

  val blockElement = BlockElement(
    `type` = ElementType.Contentatom,
    assets = Seq.empty,
    contentAtomTypeData = Some(
      ContentAtomElementFields(
        atomId = id,
        atomType = "interactive",
        role = Some(weighting),
        isMandatory = None,
      ),
    ),
  )
}

object LiveHarnessInteractiveAtom {
  implicit val reads: Reads[LiveHarnessInteractiveAtom] = Json.reads
}

object LiveHarness {

  trait PageUpdater[P <: ContentPage] { def update(page: P, content: Content): P }

  implicit val iu: PageUpdater[InteractivePage] = (ip, nc) => ip.copy(interactive = ip.item.copy(content = nc))
  implicit val au: PageUpdater[ArticlePage] = (ap, nc) => ap.copy(article = ap.item.copy(content = nc))

  def inject[P <: ContentPage](harnessAtoms: Seq[LiveHarnessInteractiveAtom])(implicit
      updater: PageUpdater[P],
  ): BlocksOn[P] => BlocksOn[P] = _.mapBoth(
    page => {
      val content = page.item.content
      updater.update(page, content.copy(atoms = content.atoms.map(_.copy(interactives = harnessAtoms.map(_.atom)))))
    },
    blocks =>
      blocks.copy(body = blocks.body.map { bodyBlocks =>
        val (headBlockOpt, tailBlocks) = bodyBlocks.splitAt(1)
        headBlockOpt.map { headBlock =>
          headBlock.copy(elements = harnessAtoms.map(_.blockElement) ++ headBlock.elements)
        } ++ tailBlocks
      }),
  )
}
