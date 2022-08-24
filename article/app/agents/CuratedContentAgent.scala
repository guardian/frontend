package agents

import com.gu.contentapi.client.utils.format.{
  CulturePillar,
  LifestylePillar,
  NewsPillar,
  OpinionPillar,
  SportPillar,
  Theme,
}
import common.editions.{Au, International, Uk, Us}
import common.{Box, Edition, GuLogging}
import model.dotcomrendering.{OnwardCollectionResponse, Trail}

class CuratedContentAgent() extends GuLogging {
  private def getContainerId(theme: Theme, edition: Edition) =
    theme match {
      case NewsPillar =>
        edition match {
          case Uk            => "uk-alpha/news/regular-stories"
          case Us            => "c5cad9ee-584d-4e85-85cd-bf8ee481b026"
          case Au            => "au-alpha/news/regular-stories"
          case International => "10f21d96-18f6-426f-821b-19df55dfb831"
        }
      case SportPillar =>
        edition match {
          case Uk            => "754c-8e8c-fad9-a927"
          case Us            => "f6dd-d7b1-0e85-4650"
          case Au            => "c45d-318f-896c-3a85"
          case International => "d1ad8ec3-5ee2-4673-94c8-cc3f8d261e52"
        }
      case OpinionPillar =>
        edition match {
          case Uk            => "3ff78b30-52f5-4d30-ace8-c887113cbe0d"
          case Us            => "98df412d-b0e7-4d9a-98c2-062642823e94"
          case Au            => "au-alpha/contributors/feature-stories"
          case International => "ee3386bb-9430-4a6d-8bca-b99d65790f3b"
        }
      case CulturePillar =>
        edition match {
          case Uk            => "ae511a89-ef38-4ec9-aab1-3a5ebc96d118"
          case Us            => "fb59c1f8-72a7-41d5-8365-a4d574809bed"
          case Au            => "22262088-4bce-4290-9810-cb50bbead8db"
          case International => "c7154e22-7292-4d93-a14d-22fd4b6b693d"
        }
      case LifestylePillar =>
        edition match {
          case Uk            => "uk-alpha/features/feature-stories"
          case Us            => "us-alpha/features/feature-stories"
          case Au            => "13636104-51ce-4264-bb6b-556c80227331"
          case International => "7b297ef5-a3f9-45e5-b915-b54951d7f6ec"
        }
      // This is the same as NewsPillar
      case _ =>
        edition match {
          case Uk            => "uk-alpha/news/regular-stories"
          case Us            => "c5cad9ee-584d-4e85-85cd-bf8ee481b026"
          case Au            => "au-alpha/news/regular-stories"
          case International => "10f21d96-18f6-426f-821b-19df55dfb831"
        }
    }

  /**
    * This would look something like
    * Map(
    *  "uk-alpha/news/regular-stories" -> Seq(trail1, trail2, ...),
    *  ...
    * )
    */
  private val trailsBox = Box[Map[String, Seq[Trail]]](Map.empty)
  def getTrails(theme: Theme, edition: Edition): Seq[Trail] = {
    val containerId = getContainerId(theme, edition)
    trailsBox.get().getOrElse(containerId, Seq())
  }
}
