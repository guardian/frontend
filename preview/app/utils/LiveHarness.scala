package utils

import com.gu.contentapi.client.model.v1.{BlockElement, ContentAtomElementFields, ElementType, TextElementFields}
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
    position: Option[Int] = None, // 1-based visual index; defaults to 1 (before everything)
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

  private val tagPattern = """(?s)(<\w[^>]*>.*?</\w+>)""".r

  def inject[P <: ContentPage](harnessAtoms: Seq[LiveHarnessInteractiveAtom])(implicit
      updater: PageUpdater[P],
  ): BlocksOn[P] => BlocksOn[P] = _.mapBoth(
    page => {
      val content = page.item.content
      updater.update(page, content.copy(atoms = content.atoms.map(_.copy(interactives = harnessAtoms.map(_.atom)))))
    },
    blocks =>
      blocks.copy(body = blocks.body.map { bodyBlocks =>
        bodyBlocks.map { block =>
          // Flatten elements into visual units: Text elements are split into
          // individual tags, all other elements count as one unit each.
          // Each unit is Either[String (text chunk), BlockElement (non-text)]
          val visualUnits: List[Either[String, BlockElement]] = block.elements.toList.flatMap {
            case el if el.`type` == ElementType.Text =>
              tagPattern.findAllIn(el.textTypeData.flatMap(_.html).getOrElse("")).toList.map(Left(_))
            case el =>
              List(Right(el))
          }

          // Insert each harness atom at its requested visual position
          val withAtoms = harnessAtoms.foldLeft(visualUnits) { (units, harnessAtom) =>
            val insertAt = (harnessAtom.position.getOrElse(1) - 1).max(0).min(units.length)
            val (before, after) = units.splitAt(insertAt)
            before ::: List(Right(harnessAtom.blockElement)) ::: after
          }

          // Repack: merge adjacent text chunks back into Text BlockElements
          val repacked: List[BlockElement] = withAtoms.foldRight(List.empty[BlockElement]) { (unit, acc) =>
            unit match {
              case Left(chunk) =>
                acc match {
                  case head :: tail if head.`type` == ElementType.Text =>
                    val existingHtml = head.textTypeData.flatMap(_.html).getOrElse("")
                    head.copy(textTypeData = Some(TextElementFields(html = Some(chunk + "\n" + existingHtml)))) :: tail
                  case _ =>
                    BlockElement(
                      `type` = ElementType.Text,
                      assets = Seq.empty,
                      textTypeData = Some(TextElementFields(html = Some(chunk))),
                    ) :: acc
                }
              case Right(el) => el :: acc
            }
          }

          block.copy(elements = repacked.toIndexedSeq)
        }
      }),
  )
}
