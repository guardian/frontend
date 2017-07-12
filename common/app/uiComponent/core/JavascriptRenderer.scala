package uiComponent.core

import java.io._
import java.nio.charset.StandardCharsets
import javax.script.SimpleScriptContext
import model.ApplicationContext
import play.api.Mode
import play.api.libs.json.{JsValue, Json}
import uiComponent.core.JavascriptEngine.EvalResult
import scala.util.{Failure, Success, Try}

class JavascriptRenderer(javascriptFile: String) {

  private implicit lazy val scriptContext = new SimpleScriptContext()
  private lazy val memoizedJs: Try[EvalResult] = loadJavascript()

  def render(props: Option[JsValue] = None)(implicit ac: ApplicationContext): Try[String] = for {
    propsObject <- encodeProps(props)
    js <- if(ac.environment.mode == Mode.Dev) loadJavascript() else memoizedJs
    rendering <- JavascriptEngine.invoke(js, "render", propsObject)
  } yield rendering

  private def encodeProps(props: Option[JsValue] = None): Try[EvalResult] = {
    val propsId = "props"
    val emptyJson = Json.obj()
    for {
      _ <- JavascriptEngine.put(propsId, props.getOrElse(emptyJson))
      propsObject <- JavascriptEngine.eval(s"JSON.parse($propsId)")
    } yield propsObject
  }

  private def loadJavascript(): Try[EvalResult] = for {
    file <- loadFile(javascriptFile)
    fullScript = new InputStreamReader(new SequenceInputStream(prescript, file))
    cs <- JavascriptEngine.compile(fullScript)
    js <- JavascriptEngine.eval(cs)
  } yield js

  // Nashorn is only a JavaScript engine, i.e. an implementation of the ECMAScript 5.1 language specification.
  // This means that global JavaScript functions such as setTimeout, setInterval and console do not exist natively in Nashorn.
  // Therefore we need to define them manually
  private def prescript: ByteArrayInputStream = {
    val pre =
      """
        |var global = global || this, self = self || this, window = window || this;
        |
        |var console = {};
        |console.debug = print
        |console.warn = print
        |console.error = print
        |console.log = print
        |console.trace = print
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

  private def loadFile(fileName: String): Try[InputStream] = {
    Option(getClass.getClassLoader.getResourceAsStream(fileName)) match {
      case Some(stream) => Success(stream)
      case None => Failure(new FileNotFoundException(s"${this.getClass.getSimpleName}: Cannot find file '$fileName'"))
    }
  }

}
