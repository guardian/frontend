package dfp.rubicon

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508.LineItemCreativeAssociationStatus.ACTIVE
import com.google.api.ads.dfp.axis.v201508._
import common.Logging
import dfp.SessionWrapper

object Creative extends Logging {

  def replaceTagCreatives(
    networkId: Long,
    advertiserId: Long,
    orderId: Long,
    templateId: Long
  ): Seq[(ThirdPartyCreative, Option[TemplateCreative])] = {

    log.info("Reading third-party creatives ...")
    val originCreatives = creativesByOrder(networkId.toString, orderId)
    log.info(s"Read ${originCreatives.size} third-party creatives")

    withDfpSession(networkId.toString) { session =>
      originCreatives zip (
        originCreatives map (replaceTagCreative(session, advertiserId, templateId, _))
        )
    }
  }

  private def replaceTagCreative(
    session: SessionWrapper,
    advertiserId: Long,
    templateId: Long,
    origin: ThirdPartyCreative
  ): Option[TemplateCreative] = {

    log.info(s"Replacing creative ${origin.getId}")

    def mkString(licas: Seq[LineItemCreativeAssociation]): String = licas.map(_.getLineItemId).mkString(", ")

    val templateCreative: Option[TemplateCreative] = {

      for {
        siteVal <- siteValue(origin)
        zoneVal <- zoneValue(origin)
        sizeVal <- sizeValue(origin)
      } yield {

        val templateCreative = new TemplateCreative()
        templateCreative.setAdvertiserId(advertiserId)
        templateCreative.setName(origin.getName)
        templateCreative.setCreativeTemplateId(templateId)
        templateCreative.setSize(origin.getSize)
        templateCreative.setCreativeTemplateVariableValues(
          Array(
            new StringCreativeTemplateVariableValue("rp_site", siteVal.toString),
            new StringCreativeTemplateVariableValue("rp_zone", zoneVal.toString),
            new StringCreativeTemplateVariableValue("rp_size", sizeVal.toString)
          )
        )

        templateCreative
      }
    }

    if (templateCreative.isEmpty) log.warn(s"Not replacing creative ${origin.getId} because of lack of data")

    val replacement = templateCreative flatMap { creative =>

      session.creatives.get(
        new StatementBuilder()
        .where(s"name = :name")
        .withBindVariableValue("name", creative.getName)
      ) find {
        _.isInstanceOf[TemplateCreative]
      } match {

        case Some(existing) =>
          log.warn(s"Not replacing creative ${origin.getId} because replacement already exists: ${existing.getId}")
          None

        case None =>

          val maybeCreated = session.creatives.create(Seq(creative)).headOption

          if (maybeCreated.isEmpty) {
            log.warn(s"Not replacing creative ${origin.getId} because can't create replacement")
            None
          }

          maybeCreated map { created =>

            val params = for {
              param <- created.asInstanceOf[TemplateCreative].getCreativeTemplateVariableValues
            } yield {
              val strParam = param.asInstanceOf[StringCreativeTemplateVariableValue]
              s"${strParam.getUniqueName} -> ${strParam.getValue}"
            }
            log.info(s"Created new template creative ${created.getId}: params ${params mkString ", "}")

            val existingUnarchivedLicas = {
              val allExistingLicas = session.lineItemCreativeAssociations.get(
                new StatementBuilder().where("status = :status AND creativeId = :creativeId")
                .withBindVariableValue("status", LineItemCreativeAssociationStatus._ACTIVE)
                .withBindVariableValue("creativeId", origin.getId)
              )
              val archivedLineItemIds = session.lineItems(
                new StatementBuilder().where(s"lineItemId IN (${mkString(allExistingLicas)})")
              ).filter(_.getIsArchived).map(_.getId)
              allExistingLicas filterNot { lica =>
                archivedLineItemIds.contains(lica.getLineItemId)
              }
            }
            if (existingUnarchivedLicas.isEmpty) {
              log.warn(s"Origin creative ${origin.getId} has no unarchived line item associations")
            } else {
              log.info(
                s"Origin creative ${origin.getId} is associated with " +
                s"unarchived line items ${mkString(existingUnarchivedLicas)}"
              )
            }

            val lineItemIds = existingUnarchivedLicas flatMap { existingLica =>
              val lica = new LineItemCreativeAssociation()
              lica.setLineItemId(existingLica.getLineItemId)
              lica.setCreativeId(created.getId)
              lica.setSizes(existingLica.getSizes)
              lica.setStartDateTimeType(existingLica.getStartDateTimeType)
              lica.setStartDateTime(existingLica.getStartDateTime)
              lica.setEndDateTime(existingLica.getEndDateTime)
              lica.setManualCreativeRotationWeight(existingLica.getManualCreativeRotationWeight)
              lica.setSequentialCreativeRotationIndex(existingLica.getSequentialCreativeRotationIndex)
              lica.setStatus(ACTIVE)
              val newLica = session.lineItemCreativeAssociations.create(Seq(lica))
              if (newLica.isEmpty)
                log.error(s"Failed to associate creative ${lica.getCreativeId} with line item ${lica.getLineItemId}")
              newLica.headOption.map(_.getLineItemId)
            }
            if (lineItemIds.nonEmpty) {
              log.info(s"Associated creative ${created.getId} with line items ${lineItemIds.mkString(", ")}")

              val numDeactivated = session.lineItemCreativeAssociations.deactivate(
                new StatementBuilder()
                .where("creativeId = :creativeId")
                .withBindVariableValue("creativeId", origin.getId)
                .toStatement
              )
              if (numDeactivated == lineItemIds.size && lineItemIds.nonEmpty) {
                val lineItems = lineItemIds.mkString(", ")
                log.info(s"Deactivated original line-item creative associations ${origin.getId} -> $lineItems")
              }
            }

            log.info(s"Finished replacing creative ${origin.getId} with creative ${created.getId}")

            created
          }
      }
    }

    replacement.map(_.asInstanceOf[TemplateCreative])
  }
}
