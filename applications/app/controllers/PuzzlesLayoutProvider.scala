package controllers

import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common.GuLogging
import contentapi.ContentApiClient
import model.CrosswordData
import model.dotcomrendering.{PuzzleItem, PuzzlesLayout}
import play.api.Environment
import play.api.libs.json.Json

import scala.concurrent.{ExecutionContext, Future}

trait PuzzlesLayoutProvider {
  def getLayout()(implicit executionContext: ExecutionContext): Future[PuzzlesLayout]
}

class LocalJsonPuzzlesLayoutProvider(
    environment: Environment,
    contentApiClient: ContentApiClient,
) extends PuzzlesLayoutProvider
    with GuLogging {
  override def getLayout()(implicit executionContext: ExecutionContext): Future[PuzzlesLayout] = {
    val baseLayout = getBaseLayout()
    enrichCrosswordItems(baseLayout).recover { case error =>
      log.warn("Failed to enrich puzzles layout with latest crosswords from CAPI", error)
      baseLayout
    }
  }

  private def getBaseLayout(): PuzzlesLayout = {
    val inputStream = environment
      .resourceAsStream("puzzles-layout.json")
      .getOrElse(throw new RuntimeException("Could not find puzzles-layout.json in classpath"))

    try {
      Json.parse(inputStream).as[PuzzlesLayout]
    } finally {
      inputStream.close()
    }
  }

  private def enrichCrosswordItems(layout: PuzzlesLayout)(implicit
      executionContext: ExecutionContext,
  ): Future[PuzzlesLayout] = {
    val crosswordSets = layout.containers
      .flatMap(_.content.items.flatten)
      .filter(item => item.`type` == "crossword" && item.variant.forall(_ != "archive"))
      .map(_.set)
      .distinct

    Future
      .traverse(crosswordSets)(set => latestCrosswordForSet(set).map(set -> _))
      .map(_.collect { case (set, Some(item)) => set -> item }.toMap)
      .map { latestCrosswords =>
        layout.copy(containers = layout.containers.map { container =>
          container.copy(content = container.content.copy(items = container.content.items.map { row =>
            row.map { item =>
              if (item.`type` == "crossword") {
                latestCrosswords.getOrElse(item.set, item)
              } else {
                item
              }
            }
          }))
        })
      }
  }

  private def latestCrosswordForSet(set: String)(implicit
      executionContext: ExecutionContext,
  ): Future[Option[PuzzleItem]] = {
    crosswordSeriesTag(set).fold(Future.successful(Option.empty[PuzzleItem])) { tag =>
      val query = SearchQuery()
        .contentType("crossword")
        .tag(tag)
        .useDate("newspaper-edition")
        .orderBy("newest")
        .pageSize(1)
        .showFields("all")

      contentApiClient
        .getResponse(query)
        .map(_.results.headOption.flatMap(toPuzzleItem(set)))
        .recover { case error =>
          log.warn(s"Failed to fetch latest $set crossword from CAPI", error)
          None
        }
    }
  }

  private def crosswordSeriesTag(set: String): Option[String] =
    set match {
      case "mini"          => Some("crosswords/series/mini-crossword")
      case "weekend"       => Some("crosswords/series/weekend-crossword")
      case "quick"         => Some("crosswords/series/quick")
      case "cryptic"       => Some("crosswords/series/cryptic")
      case "prize"         => Some("crosswords/series/prize")
      case "sunday-quick"  => Some("crosswords/series/sunday-quick")
      case "quick-cryptic" => Some("crosswords/series/quick-cryptic")
      case "everyman"      => Some("crosswords/series/everyman")
      case "speedy"        => Some("crosswords/series/speedy")
      case "quiptic"       => Some("crosswords/series/quiptic")
      case "genius"        => Some("crosswords/series/genius")
      case "special"       => Some("crosswords/series/special")
      case "azed"          => Some("crosswords/series/azed")
      case _               => None
    }

  private def toPuzzleItem(set: String)(content: ApiContent): Option[PuzzleItem] = {
    content.crossword.map { crossword =>
      val crosswordData = CrosswordData.fromCrossword(crossword, content)
      val crosswordType = crosswordData.crosswordType
      val crosswordNumber = crosswordData.number

      PuzzleItem(
        title = content.webTitle,
        `type` = "crossword",
        set = set,
        url = Some(s"/puzzles/crosswords/$crosswordType/$crosswordNumber"),
        image = Some(
          s"https://api.nextgen.guardianapps.co.uk/crosswords/$crosswordType/$crosswordNumber.svg",
        ),
      )
    }
  }
}