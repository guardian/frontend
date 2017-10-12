package rendering.core

import java.io._
import java.nio.charset.StandardCharsets
import java.nio.file.{Files, Paths}
import javax.script.{CompiledScript, SimpleScriptContext}

import common.Logging
import play.api.libs.json._
import rendering.core.JavascriptEngine.EvalResult

import scala.util.{Failure, Try}

trait JavascriptRendering extends Logging {

  case class TypeFace(typeFace: String, fileTypes: Seq[FileType])

  object TypeFace {
    implicit val typeFaceWriter: Writes[TypeFace] = Json.writes[TypeFace]
  }

  case class FileType(fileType: String, endpoint: String, hintTypes: Seq[HintType])

  object FileType {
    implicit val fileTypeWriter: Writes[FileType] = Json.writes[FileType]
  }

  case class HintType(hintType: String, endpoint: String)

  object HintType {
    implicit val hintTypeWriter: Writes[HintType] = Json.writes[HintType]
  }

  private def getFontDefinitions(): JsValue = {
    val typeFaces = List("GuardianEgyptianWeb", "GuardianTextEgyptianWeb", "GuardianSansWeb", "GuardianTextSansWeb")
    val fileTypes = List("woff2", "woff", "ttf")
    val hintTypes = List("cleartype", "auto")

    val fontDefinitions = typeFaces.map(typeFace => {
      TypeFace(typeFace, fileTypes.map { fileType =>
        val fileTypeEndpoint = conf.Static(s"fonts/${typeFace}.${fileType}.json")
        
        FileType(fileType, fileTypeEndpoint, hintTypes.map { hintType => {
          val hintTypeEndpoint = conf.Static(s"fonts/${typeFace}${hintType.capitalize}Hinted.${fileType}.json")
          HintType(hintType, hintTypeEndpoint)
        }})
      })
    })

    Json.toJson(fontDefinitions)
  }

  def javascriptFile: String

  private implicit val scriptContext = createContext()
  private val memoizedJs: Try[EvalResult] = loadJavascript()

  private def getProps(props: Option[JsValue] = None): JsValue =
    JavascriptProps.default.asJsValue.as[JsObject] ++ props.map(_.as[JsObject]).getOrElse(Json.obj())

  def render(props: Option[JsValue] = None, forceReload: Boolean = false): Try[String] = for {
      propsObject <- encodeProps(getProps(props))
      js <- if(forceReload) loadJavascript() else memoizedJs
      rendering <- JavascriptEngine.invoke(js, "render", propsObject)
    } yield rendering

  private def createContext(): SimpleScriptContext = {
    val context = new SimpleScriptContext()
    JavascriptEngine.put("__play_webpack_logger", log.logger)(context) // Binding webpack logger to scala logger
    context
  }

  private def encodeProps(props: JsValue): Try[EvalResult] = {
    val propsId = "props"

    for {
      _ <- JavascriptEngine.put(propsId, props)
      propsObject <- JavascriptEngine.eval(s"JSON.parse($propsId)")
    } yield propsObject
  }

  private def compile(inputStream: InputStream): Try[CompiledScript] = {
    val fullScript = new InputStreamReader(new SequenceInputStream(prescript, inputStream))
    JavascriptEngine.compile(fullScript)
  }

  private def loadJavascript(): Try[EvalResult] = for {
    file <- loadFile(javascriptFile)
    cs <- compile(file)
    js <- JavascriptEngine.eval(cs)
  } yield js

  // Nashorn is only a JavaScript engine, i.e. an implementation of the ECMAScript 5.1 language specification.
  // This means that global JavaScript functions such as setTimeout, setInterval and console do not exist natively in Nashorn.
  // Therefore we need to define them manually
  private def prescript: ByteArrayInputStream = {
    val pre =
      """
        |var global = global || this, self = self || this;
        |
        |var console = {};
        |
        |var logger = function(type) {
        |  return function () {
        |    for (var i = 0, len = arguments.length; i < len; i++) {
        |      print(arguments[i]);
        |      __play_webpack_logger[type](arguments[i]);
        |    }
        |  }
        |};
        |console.debug = logger("debug");
        |console.warn = logger("warn");
        |console.error = logger("error");
        |console.log = logger("info");
        |console.trace = logger("trace");
        |
        |global.setTimeout = function(fn, delay) {
        |  return __play_webpack_setTimeout.apply(fn, delay || 0);
        |};
        |
        |global.clearTimeout = function(timer) {
        |  return __play_webpack_clearTimeout.apply(timer);
        |};
        |
        |global.setImmediate = function(fn) {
        |  return __play_webpack_setTimeout.apply(fn, 0);
        |};
        |
        |global.clearImmediate = function(timer) {
        |  return __play_webpack_clearTimeout.apply(timer);
        |};
      """
        .stripMargin
    new ByteArrayInputStream(pre.getBytes(StandardCharsets.UTF_8))
  }

  private def loadFile(file: String): Try[InputStream] = {
    Try(Files.newInputStream(Paths.get(file)))
      .recoverWith { case f => Failure(new FileNotFoundException(s"${f.getLocalizedMessage}. Have you run `make ui-compile`?")) }
  }

}
