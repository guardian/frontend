package model.diagnostics.quizzes

import java.text.SimpleDateFormat

import common.ExecutionContexts
import conf.Configuration
import org.json4s.{DefaultFormats, _}
import org.json4s.native.JsonMethods._
import org.json4s.native.Serialization
import play.api.Logger
import play.api.libs.json.{Json, JsValue}
import shade.memcached.{Codec, Configuration => MemcachedConf, Memcached}

import scala.concurrent.Future
import scala.concurrent.duration.Duration

object Quizzes extends ExecutionContexts {

  implicit val json4sFormats = new DefaultFormats {
    override def dateFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
  } ++ org.json4s.ext.JodaTimeSerializers.all

  implicit val memcacheDCodec: Codec[QuizAggregate] = new Codec[QuizAggregate] {

    override def serialize(value: QuizAggregate): Array[Byte] = Serialization.write(value).getBytes("UTF-8")

    override def deserialize(data: Array[Byte]): QuizAggregate = parse(new String(data, "UTF-8")).extract[QuizAggregate]

  }

  lazy val host = Configuration.memcached.host.head
  lazy val memcached = Memcached(MemcachedConf(host), memcachedExecutionContext)

  def update(json: JsValue) = {
    val quizUpdate = parse(Json.stringify(json)).extract[QuizUpdate]
    for {
      stat <- getResults(quizUpdate.quizId)
      x = addLatest(stat, quizUpdate)
      _ <- memcached.set[QuizAggregate](quizUpdate.quizId, x, Duration.Inf)
    } yield (())
  }

  def results(quizId: String): Future[String] = {
    getResults(quizId).map(x => Serialization.write(x))
  }

  def getResults(quizId: String): Future[QuizAggregate] = {
    memcached.get[QuizAggregate](quizId).recover {
      case e: Exception =>
        Logger.error(e.getMessage)
        None
    }.map(_.getOrElse(QuizAggregate(quizId, Nil, Nil, 0)))
  }

  def addLatest(agg: QuizAggregate, upd: QuizUpdate) = {
    QuizAggregate(agg.quizId,
      addResultsToList(agg.results, upd.results),
      incrementByIndex(agg.scoreHistogram, upd.score, 40),
      agg.timeTaken + upd.timeTaken)
  }

  def addResultsToList(aggList: List[List[Int]], newVals: List[Int]) = {
    val extendedAgg = (aggList.toStream ++ Stream.continually(Nil)).take(40) // max 40 questions
    extendedAgg.zip(newVals).toList.map{ x => incrementByIndex(x._1, x._2) }
  }

  def incrementByIndex(a: List[Int], b: Int, limit: Int = 5): List[Int] = {
    (a, b) match {
      case (list, n) if n > limit => list // prevent people adding more than 5 responses
      case (Nil, 0) => List(1)
      case (Nil, n) => List.fill(n)(0) ++ List(1)
      case (x::xs, 0) => x + 1 :: xs
      case (x::xs, n) => x :: incrementByIndex(xs, n - 1, limit)
    }
  }

  case class QuizUpdate (
    quizId: String,
    results: List[Int],
    score: Int,
    timeTaken: Long)

  case class QuizAggregate (
    quizId: String,
    results: List[List[Int]],
    scoreHistogram: List[Int],
    timeTaken: Long)

}
