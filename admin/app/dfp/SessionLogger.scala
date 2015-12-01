package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508._
import common.Logging

import scala.util.control.NonFatal

private[dfp] object SessionLogger extends Logging {

  def logAroundRead[T](typesToRead: String, stmtBuilder: StatementBuilder)(read: => Seq[T]): Seq[T] = {
    logAroundSeq(typesToRead, opName = "reading", Some(stmtBuilder.toStatement))(read)
  }

  def logAroundCreate[T](typesToCreate: String)(create: => Seq[T]): Seq[T] = {
    logAroundSeq(typesToCreate, opName = "creating")(create)
  }

  def logAroundPerform(typesName: String, opName: String, statement: Statement)(op: => Int): Int = {
    logAround(typesName, opName, Some(statement))(op)(identity) getOrElse 0
  }

  private def logAroundSeq[T](typesName: String, opName: String, statement: Option[Statement] = None)
    (op: => Seq[T]): Seq[T] = {
    logAround(typesName, opName, statement)(op)(_.size) getOrElse Nil
  }

  private def logAround[T](typesName: String, opName: String, statement: Option[Statement] = None)
    (op: => T)(numAffected: T => Int): Option[T] = {

    def logApiException(e: ApiException, baseMessage: String): Unit = {
      e.getErrors foreach { err =>
        val reasonMsg = err match {
          case freqCapErr: FrequencyCapError => s", with the reason '${freqCapErr.getReason}'"
          case notNullErr: NotNullError => s", with the reason '${notNullErr.getReason}'"
          case _ => ""
        }
        val path = err.getFieldPath
        val trigger = err.getTrigger
        val msg = s"'${err.getErrorString}'$reasonMsg"
        log.error(
          s"$baseMessage failed: API exception in field '$path', " +
          s"caused by an invalid value '$trigger', " +
          s"with the error message $msg"
        )
      }
    }

    val maybeQryLogMessage = statement map { stmt =>
      val qry = stmt.getQuery
      val params = stmt.getValues.map { param =>
        val k = param.getKey
        val rawValue = param.getValue
        k -> (
          rawValue match {
            case t: TextValue => s""""${t.getValue}""""
            case n: NumberValue => n.getValue
            case b: BooleanValue => b.getValue
            case other => other.toString
          }
          )
      }.toMap
      val paramStr = if (params.isEmpty) "" else params.toString
      s"""with statement "$qry" and params $paramStr"""
    }
    val baseMessage = s"$opName $typesName"
    val msgPrefix = maybeQryLogMessage map (qryLogMsg => s"$baseMessage $qryLogMsg") getOrElse baseMessage

    try {
      log.info(s"$msgPrefix ...")
      val start = System.currentTimeMillis()
      val result = op
      val duration = System.currentTimeMillis() - start
      log.info(s"Successful $opName of ${numAffected(result)} $typesName in $duration ms")
      Some(result)
    } catch {
      case e: ApiException =>
        logApiException(e, msgPrefix)
        None
      case NonFatal(e) =>
        log.error(s"$msgPrefix failed: ${e.getMessage}")
        None
    }
  }
}
