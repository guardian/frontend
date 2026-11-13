package frontpress

import com.gu.facia.api.{models => fapi}
import com.gu.facia.api.models.PublicationStatus
import com.gu.facia.api.utils.FaciaContentUtils
import com.gu.facia.client.models.{CustomSubnav, MetaDataCommonFields, Trail}
import model.pressed._
import services.SubnavAgent

private[frontpress] object MiniNavContentPressing {
  private case class MiniNavSettings(
      show: Boolean = false,
      data: Option[CustomSubnav] = None,
      supporting: Map[String, MiniNavSettings] = Map.empty,
  )

  def pressContents(
      items: List[fapi.FaciaContent],
      trails: List[Trail],
      suppressImages: Boolean,
      status: PublicationStatus,
      subnavAgent: SubnavAgent,
  ): List[PressedContent] = {
    def settings(meta: MetaDataCommonFields): MiniNavSettings = {
      val show = meta.showMiniNav.contains(true)
      val id = meta.json.get("miniNavId").flatMap(_.asOpt[String]).filter(_.nonEmpty)
      MiniNavSettings(
        show = show,
        data =
          if (show)
            id.flatMap(subnavAgent.getSubnavById(_, status))
              .orElse(meta.miniNavUrl.filter(_.nonEmpty).flatMap(subnavAgent.getSubnavByUrl(_, status)))
          else None,
      )
    }

    def normalizeId(id: String): String = id.stripPrefix("snap/")

    def settingsFor(content: fapi.FaciaContent, byId: Map[String, MiniNavSettings]): MiniNavSettings = {
      val internalPageCode = content match {
        case curated: fapi.CuratedContent              => curated.content.fields.flatMap(_.internalPageCode)
        case supporting: fapi.SupportingCuratedContent => supporting.content.fields.flatMap(_.internalPageCode)
        case _                                         => None
      }
      internalPageCode
        .flatMap(code => byId.get(s"internal-code/page/$code"))
        .orElse(byId.get(normalizeId(FaciaContentUtils.id(content))))
        .getOrElse(MiniNavSettings())
    }

    // FAPI content does not retain mini-nav metadata, so join it back to its source trail.
    val settingsById = trails.map { trail =>
      val meta = trail.safeMeta
      val supporting = meta.supporting.toList.flatten.map { item =>
        normalizeId(item.id) -> item.meta
          .map(settings)
          .getOrElse(MiniNavSettings())
      }.toMap
      normalizeId(trail.id) -> settings(meta).copy(supporting = supporting)
    }.toMap

    def applySettings(
        content: PressedContent,
        source: fapi.FaciaContent,
        settings: MiniNavSettings,
    ): PressedContent = {
      val display = content.display.copy(showMiniNav = settings.show, miniNavData = settings.data)
      content match {
        case curated: CuratedContent =>
          val sourceSupporting = FaciaContentUtils.supporting(source)
          curated.copy(
            display = display,
            supportingContent = curated.supportingContent.zip(sourceSupporting).map { case (pressed, original) =>
              applySettings(pressed, original, settingsFor(original, settings.supporting))
            },
          )
        case supporting: SupportingCuratedContent => supporting.copy(display = display)
        case linkSnap: LinkSnap                   => linkSnap.copy(display = display)
        case latestSnap: LatestSnap               => latestSnap.copy(display = display)
        case eventGraphic: EventGraphic           => eventGraphic.copy(display = display)
      }
    }

    items.map { item =>
      applySettings(PressedContent.make(item, suppressImages), item, settingsFor(item, settingsById))
    }
  }
}
