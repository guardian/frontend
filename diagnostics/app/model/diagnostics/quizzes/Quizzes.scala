package model.diagnostics.quizzes

import java.text.SimpleDateFormat

import common.ExecutionContexts
import conf.Configuration
import org.json4s.native.JsonMethods._
import play.api.Logger
import shade.memcached.{Configuration => MemcachedConf, Codec, Memcached}
import org.joda.time.DateTime
import org.json4s.{DefaultFormats, Extraction}

import scala.concurrent.Future

object Quizzes extends ExecutionContexts {
  implicit val formats = new DefaultFormats {
    override def dateFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
  } ++ org.json4s.ext.JodaTimeSerializers.all


  lazy val host = Configuration.memcached.host.head
  lazy val memcached = Memcached(MemcachedConf(host), memcachedExecutionContext)

//  def update(json: String) = {
//    val quizUpdate = parse(json).extract[QuizUpdate]
//    val oldStats = results(quizUpdate.quizId)
//
//    val x = for {
//      stat <- oldStats
//    } yield {
//      addLatest(stat, quizUpdate)
//    }
//    memcached.set[QuizUpdate](quizUpdate.quizId, quizUpdate, )
//  }

  private def addLatest(agg: QuizAggregate, upd: QuizUpdate) = {
    QuizAggregate(agg.quizId, addResultsToList(agg.results, upd.results), agg.timeTaken + upd.timeTaken)
  }

  def addResultsToList(aggList: List[List[Int]], newVals: List[Int]) = {
    val extendedAgg = aggList.toStream ++ Stream.continually(Nil)
    extendedAgg.zip(newVals).toList.map{ x => incrementByIndex(x._1, x._2) }
  }

  def incrementByIndex(a: List[Int], b: Int): List[Int] = {
    // a mght be too short
    (a, b) match {
      case (Nil, 0) => List(1)
      case (Nil, n) => List.fill(n)(0) ++ List(1)
      case (x::xs, 0) => x + 1 :: xs
      case (x::xs, n) => x :: incrementByIndex(xs, b - 1)
    }
  }

//  def results(quizId: String): Future[QuizAggregate] = {
//    memcached.get[QuizAggregate](quizId).recover {
//      case e: Exception =>
//        Logger.error(e.getMessage)
//        None
//    }
//  }.map(_.getOrElse(QuizAggregate(quizId, Nil, 0)))
}

case class QuizUpdate (
  quizId: String,
  results: List[Int],
  timeTaken: Long)
{
//  def toJson = Extraction.decompose(this)
}

case class QuizAggregate (
  quizId: String,
  results: List[List[Int]],
  timeTaken: Long)
{
//  def toJson = Extraction.decompose(this)
  def isCorrect(q: Int) = {
    results(q) == 1
  }
}
