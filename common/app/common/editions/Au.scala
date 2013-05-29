package common.editions

import org.joda.time.DateTimeZone
import model.{CustomTrailblockDescription, TrailblockDescription, MetaData}
import common.{Zones, Sections, Edition}
import views.support.Featured
import scala.concurrent.Future
import com.gu.openplatform.contentapi.model.ItemResponse
import conf.ContentApi
import contentapi.QueryDefaults


//This object exists to be used with ItemTrailblockDescription and is not a real edition like the others.
//All that is really being used is Edition.id, which is AU
//It is not included in the Edition.all sequence
object Au extends Edition("AU", "Australia edition", DateTimeZone.forID("Australia/Sydney")) with Sections with Zones with QueryDefaults {

  val cultureCustomBlock = CustomTrailblockDescription("culture", "Culture", numItemsVisible = 3, style = Some(Featured)){

    val promiseOfCulture: Future[ItemResponse] = ContentApi.item.itemId("culture")
      .edition("au")
      .showTags("all")
      .showFields(trailFields)
      .showInlineElements(inlineElements)
      .showMedia("all")
      .showReferences(references)
      .showStoryPackage(true)
      .tag(s"-stage/stage,-artanddesign/art,-stage/theatre,-stage/dance,-stage/comedy,-stage/musicals,-artanddesign/photography,($supportedTypes)")
      .response

    EditorsPicsAndLatest(promiseOfCulture)
  }

  val commentCustomBlock = CustomTrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 3, style = Some(Featured)){

    val promiseOfComment: Future[ItemResponse] = ContentApi.item.itemId("commentisfree")
      .edition("au")
      .showTags("all")
      .showFields(trailFields)
      .showInlineElements(inlineElements)
      .showMedia("all")
      .showReferences(references)
      .showStoryPackage(true)
      .tag(s"world/australia,($supportedTypes)")
      .response

    EditorsPicsAndLatest(promiseOfComment)
  }


  val zones = Nil

  def navigation(metadata: MetaData) = Nil

  val configuredFronts = Map.empty[String, Seq[TrailblockDescription]]
}
