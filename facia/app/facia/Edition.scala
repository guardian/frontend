package facia

import play.api.mvc.RequestHeader

/**
 * Created with IntelliJ IDEA.
 * User: dhurley
 * Date: 03/07/2013
 * Time: 10:55
 * To change this template use File | Settings | File Templates.
 */
// describes the ways in which facia.editions differ from each other
abstract class Edition(
                         val id: String,
                         val displayName: String,
                         val timezone: DateTimeZone,
                         val hreflang: String // see http://support.google.com/webmasters/bin/answer.py?hl=en&answer=189077
                         ) {
                            def configuredFronts: Map[String, Seq[TrailblockDescription]]
                            def zones: Seq[Zone]
                            def navigation(metadata: MetaData): Seq[NavItem]
                          }

object Edition {

   // gives templates an implicit edition
   implicit def edition(implicit request: RequestHeader) = this(request)

   val defaultEdition = editions.Uk

   val all = Seq(
     editions.Uk,
     editions.Us
   )

   def apply(request: RequestHeader): Edition = {

     // override for Ajax calls
     val editionFromParameter = request.getQueryString("_edition").map(_.toUpperCase)

     // set upstream from geo location/ user preference
     val editionFromHeader = request.headers.get("X-Gu-Edition").map(_.toUpperCase)

     // TODO legacy fallback - delete after single site
     val editionFromSite = Site(request).map(_.edition)

     // NOTE: this only works on dev machines for local testing
     // in production no cookies make it this far
     val editionFromCookie = request.cookies.get("GU_EDITION").map(_.value.toUpperCase)

     val editionId = editionFromParameter
       .orElse(editionFromHeader)
       .orElse(editionFromCookie)
       .orElse(editionFromSite)
       .getOrElse(Edition.defaultEdition.id)

     all.find(_.id == editionId).getOrElse(defaultEdition)
   }

   def others(implicit request: RequestHeader): Seq[Edition] = {
     val currentEdition = Edition(request)
     all.filter(_ != currentEdition)
   }
 }

object Editionalise {
   import common.editions.EditionalisedSections._

   //TODO this scheme changes at some point (awaiting content api work)
   def apply(id: String, edition: Edition, request: Option[RequestHeader] = None): String = {

     // TODO temporarily support old style (non-editionalised) ids
     val isLegacy = request.flatMap(Site(_)).isDefined

     if (isLegacy || !isEditionalised(id)) {
       id
     } else {
       id match {
         case "" => s"${edition.id.toLowerCase}-edition"
         case _ => s"$id/${edition.id.toLowerCase}-edition"
       }
     }
   }

   def apply(id: String, request: RequestHeader): String = this(id, Edition(request), Some(request))

 }