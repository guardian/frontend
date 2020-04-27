package model.content

import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.contentatom.renderer.{ArticleConfiguration, AudioSettings}
import com.gu.contentatom.thrift.atom.media.{Asset => AtomApiMediaAsset, MediaAtom => AtomApiMediaAtom}
import com.gu.contentatom.thrift.atom.timeline.{TimelineItem => TimelineApiItem}
import com.gu.contentatom.thrift.{AtomData, Atom => AtomApiAtom, Image => AtomApiImage, ImageAsset => AtomApiImageAsset, atom => atomapi}
import conf.Configuration
import enumeratum._
import model.{ImageAsset, ImageMedia, ShareLinkMeta}
import org.apache.commons.lang3.time.DurationFormatUtils
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTime, DateTimeZone, Duration}
import play.api.libs.json.{JsError, JsSuccess, Json}
import quiz._
import views.support.GoogleStructuredData

sealed trait MediaWrapper extends EnumEntry

object MediaWrapper extends Enum[MediaWrapper] with PlayJsonEnum[MediaWrapper] {
  val values = findValues

  case object MainMedia extends MediaWrapper
  case object ImmersiveMainMedia extends MediaWrapper
  case object EmbedPage extends MediaWrapper
  case object VideoContainer extends MediaWrapper
}

