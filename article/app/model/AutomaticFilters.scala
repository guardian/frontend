package model

import common.GuLogging
import TopMentionEntity.TopMentionEntity

object AutomaticFilters extends GuLogging {

  def getAutomaticFilter(filter: Option[String]): Option[(TopMentionEntity, String)] = {
    filter.flatMap { f =>
      val filterEntity = f.split(":")
      if (filterEntity.length == 2) {
        val entityType = TopMentionEntity.withNameOpt(filterEntity(0).toUpperCase)
        if (entityType.isEmpty) {
          log.info(s"automaticFilter query parameter entity ${filterEntity(0)} is invalid")
          None
        } else {
          Some(entityType.get, filterEntity(1))
        }
      } else {
        log.error(s"automaticFilter query parameter is invalid for ${f}, the format is <type>:<name>")
        None
      }
    }
  }
}
