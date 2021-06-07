package football.controllers

import feed.CompetitionsService
import model.Cached.RevalidatableResult
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import common.{GuLogging, ImplicitControllerExecutionContext, JsonComponent}
import model.{ApplicationContext, Cached}
import football.model.{CompetitionStage, Groups, KnockoutSpider}
import pa.{FootballMatch}

import java.time.ZonedDateTime

class WallchartController(
    competitionsService: CompetitionsService,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  object WallchartController {
    def nextMatch(matches: Seq[FootballMatch], after: ZonedDateTime): Option[FootballMatch] = {
      val ordered = matches.sortBy(_.date.toInstant.toEpochMilli)
      ordered.find(game => game.date.isAfter(after))
    }
  }

  def renderWallchartEmbed(competitionTag: String): Action[AnyContent] = renderWallchart(competitionTag, true)

  def renderWallchart(competitionTag: String, embed: Boolean = false): Action[AnyContent] =
    Action { implicit request =>
      competitionsService
        .competitionsWithTag(competitionTag)
        .map { competition =>
          val page = new FootballPage(
            competition.url.stripSuffix("/"),
            "football",
            s"${competition.fullName} wallchart",
          )
          val competitionStages = new CompetitionStage(competitionsService.competitions)
            .stagesFromCompetition(competition, KnockoutSpider.orderings)
          val nextMatch = WallchartController.nextMatch(competition.matches, ZonedDateTime.now())
          Cached(60) {
            if (embed)
              RevalidatableResult.Ok(
                football.views.html.wallchart.embed(page, competition, competitionStages, nextMatch),
              )
            else
              RevalidatableResult.Ok(
                football.views.html.wallchart.page(page, competition, competitionStages, nextMatch),
              )
          }
        }
        .getOrElse(NotFound)
    }

  def renderGroupTablesEmbed(competitionTag: String): Action[AnyContent] =
    Action { implicit request =>
      competitionsService
        .competitionsWithTag(competitionTag)
        .map { competition =>
          val page = new FootballPage(
            competition.url.stripSuffix("/"),
            "football",
            s"${competition.fullName} group tables",
          )
          val competitionStages = new CompetitionStage(competitionsService.competitions)
            .stagesFromCompetition(competition, KnockoutSpider.orderings)

          val groupStages = competitionStages.collect { case stage: Groups => stage }

          val nextMatch = WallchartController.nextMatch(competition.matches, ZonedDateTime.now())
          Cached(60) {
            RevalidatableResult.Ok(
              football.views.html.wallchart.groupTablesEmbed(page, competition, groupStages, nextMatch),
            )
          }
        }
        .getOrElse(NotFound)
    }

  def renderIndividualGroupTableEmbed(competitionTag: String, groupIds: String): Action[AnyContent] = {
    def convertGroupIdToInt(groupLetter: String): Option[Int] = {
      val groupIdMap = Map("a" -> 1, "b" -> 2, "c" -> 3, "d" -> 4, "e" -> 5, "f" -> 6, "g" -> 7, "h" -> 8)
      groupIdMap.get(groupLetter)
    }

    val groupIdsAsInt = groupIds.split(",").toList.flatMap(convertGroupIdToInt(_))
    Action { implicit request =>
      competitionsService
        .competitionsWithTag(competitionTag)
        .flatMap { competition =>
          val competitionStages = new CompetitionStage(competitionsService.competitions)
            .stagesFromCompetition(competition, KnockoutSpider.orderings)

          val groupStages = competitionStages.collectFirst { case stage: Groups => stage }
          groupStages.map { group =>
            Cached(60) {
              RevalidatableResult.Ok(
                football.views.html.wallchart
                  .groupTableEmbed(competition, group, groupIdsAsInt),
              )
            }
          }
        }
        .getOrElse(NotFound)
    }
  }

  def renderWallchartHTML(competitionID: String): Action[AnyContent] =
    Action { implicit request =>
      competitionsService
        .competitionsWithTag(competitionID: String)
        .map { competition =>
          val page = new FootballPage(
            competition.url.stripSuffix("/"),
            "football",
            s"${competition.fullName} wallchart",
          )
          val competitionStages = new CompetitionStage(competitionsService.competitions)
            .stagesFromCompetition(competition, KnockoutSpider.orderings)

          val nextMatch = WallchartController.nextMatch(competition.matches, ZonedDateTime.now())
          Cached(60) {
            RevalidatableResult.Ok(
              football.views.html.wallchart.embed(page, competition, competitionStages, nextMatch),
            )
          }
        }
        .getOrElse(NotFound)
    }

  def renderSpiderEmbed(competitionTag: String): Action[AnyContent] =
    Action { implicit request =>
      competitionsService
        .competitionsWithTag(competitionTag)
        .map { competition =>
          val page = new FootballPage(
            competition.url.stripSuffix("/"),
            "football",
            s"${competition.fullName} wallchart",
          )
          val competitionStages = new CompetitionStage(competitionsService.competitions)
            .stagesFromCompetition(competition, KnockoutSpider.orderings)
          val knockoutSpiderStages = competitionStages.collect { case stage: KnockoutSpider => stage }
          val nextMatch = WallchartController.nextMatch(competition.matches, ZonedDateTime.now())
          Cached(60) {
            RevalidatableResult.Ok(
              football.views.html.wallchart.spiderEmbed(page, competition, knockoutSpiderStages, nextMatch),
            )
          }
        }
        .getOrElse(NotFound)
    }

  def renderSpiderEmbedForRound(competitionTag: String, roundId: String): Action[AnyContent] =
    Action { implicit request =>
      competitionsService
        .competitionsWithTag(competitionTag)
        .flatMap { competition =>
          val page = new FootballPage(
            competition.url.stripSuffix("/"),
            "football",
            s"${competition.fullName} wallchart",
          )
          val competitionStages = new CompetitionStage(competitionsService.competitions)
            .stagesFromCompetition(competition, KnockoutSpider.orderings)
          val knockoutSpiderStages = competitionStages.collectFirst { case stage: KnockoutSpider => stage }

          knockoutSpiderStages.flatMap { stage =>
            stage.rounds.find(x => x.roundNumber == roundId).map { round =>
              {
                val nextMatch = WallchartController.nextMatch(competition.matches, ZonedDateTime.now())
                Cached(60) {
                  RevalidatableResult.Ok(
                    football.views.html.wallchart.spiderRoundEmbed(page, competition, stage, round, nextMatch),
                  )
                }
              }
            }
          }
        }
        .getOrElse(NotFound)
    }

  def renderWallchartJson(competitionTag: String): Action[AnyContent] =
    Action { implicit request =>
      competitionsService.competitionsWithTag(competitionTag) match {
        case Some(competition) if KnockoutSpider.orderings.contains(competition.id) => {
          new CompetitionStage(competitionsService.competitions)
            .stagesFromCompetition(competition, KnockoutSpider.orderings)
            .collectFirst({ case spider: KnockoutSpider => spider })
            .map(spider =>
              Cached(60) {
                JsonComponent(football.views.html.wallchart.wallchartComponent(competition, spider))
              },
            )
            .getOrElse(NotFound)
        }
        case _ => NotFound
      }
    }
}
