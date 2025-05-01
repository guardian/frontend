package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.{CrosswordCreator, CrosswordDimensions, CrosswordEntry}
import play.api.libs.json._

import scala.collection.Seq

case class CrosswordPosition(x: Int, y: Int)

object CrosswordPosition {
  implicit val jsonWrites: OWrites[CrosswordPosition] = Json.writes[CrosswordPosition]
}

case class EditionsCrosswordEntry(
                                   id: String,
                                   number: Int,
                                   humanNumber: String,
                                   clue: String,
                                   direction: String,
                                   length: Int,
                                   group: Seq[String],
                                   position: CrosswordPosition,
                                   separatorLocations: Option[Map[String, Seq[Int]]],
                                   solution: Option[String],
                                 )

object EditionsCrosswordEntry {
  implicit val jsonWrites: OWrites[EditionsCrosswordEntry] = Json.writes[EditionsCrosswordEntry]

  def fromCrosswordEntry(entry: CrosswordEntry, shipSolutions: Boolean): EditionsCrosswordEntry = {
    EditionsCrosswordEntry(
      id = entry.id,
      number = entry.number.getOrElse(0),
      humanNumber = entry.humanNumber.getOrElse(""),
      clue = entry.clue.getOrElse(""),
      direction = entry.direction.getOrElse(""),
      length = entry.length.getOrElse(0),
      group = entry.group.getOrElse(Seq.empty),
      position = CrosswordPosition(entry.position.map(_.x).getOrElse(0), entry.position.map(_.y).getOrElse(0)),
      separatorLocations = entry.separatorLocations.map(_.toMap.view.mapValues(_.toSeq).toMap),
      solution = if (shipSolutions) entry.solution else None,
    )
  }
}

case class EditionsCrosswordRenderingDataModel(
                                                id: String,
                                                number: Int,
                                                name: String,
                                                creator: Option[CrosswordCreator],
                                                date: Long,
                                                webPublicationDate: Long,
                                                entries: Seq[EditionsCrosswordEntry],
                                                solutionAvailable: Boolean,
                                                dateSolutionAvailable: Long,
                                                dimensions: CrosswordDimensions,
                                                crosswordType: String,
                                                pdf: Option[String],
                                                instructions: Option[String],
                                              )

object EditionsCrosswordRenderingDataModel {
  implicit val crosswordCreatorWrites: OWrites[CrosswordCreator] = Json.writes[CrosswordCreator]
  implicit val crosswordDimensionsWrites: OWrites[CrosswordDimensions] = Json.writes[CrosswordDimensions]
  implicit val jsonWrites: OWrites[EditionsCrosswordRenderingDataModel] = Json.writes[EditionsCrosswordRenderingDataModel]

  def toJson(model: EditionsCrosswordRenderingDataModel): JsValue = {
    Json.toJson(model)
  }
}
