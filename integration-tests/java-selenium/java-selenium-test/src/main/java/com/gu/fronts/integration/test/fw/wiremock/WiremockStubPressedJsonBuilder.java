package com.gu.fronts.integration.test.fw.wiremock;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.log4j.Logger;
import org.apache.log4j.spi.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.github.tomakehurst.wiremock.client.MappingBuilder;
import com.gu.fronts.integration.test.common.util.IoUtils;

/**
 * Very simple builder implementation which just wraps Wiremock Java DSL to simply create stub expectations for
 * pressed.json originally returned by AWS. Caveat, of its simple implementation, is that the methods must be called in
 * order, for it to work. so {@link #path(String)} must be called before {@link #withResponse()}
 */
@Component
public class WiremockStubPressedJsonBuilder {
    
    private static Log LOG = LogFactory.getLog(WiremockStubPressedJsonBuilder.class);

    // stubPath("/uk").withResponse("NetworkStartPage-pressed.json");
    @Value("${fronts.env}")
    protected String frontsEnv;
    private MappingBuilder mappingBuilder;
    private String path;

    /**
     * Mocks an outgoing request context path for a pressed.json request. E.g. /uk or /uk/commentisfree<br>
     * Use {@link #withResponse()} to specify the pressed.json file to be return.
     */
    public WiremockStubPressedJsonBuilder path(String path) {
        String requestPath = "/aws-frontend-store/" + frontsEnv + "/frontsapi/pressed" + path
                + "/pressed.json";
        LOG.debug("Creating pressed.json stub for path: "+requestPath);
        this.mappingBuilder = get(urlEqualTo(requestPath));
        this.path = path;
        return this;
    }

    /**
     * Specify the pressed.json response file to return as stubbed response. It is expected to be found, in the
     * classpath, under the path, specified in a previous {@link #path(String)} request, in stubbedFolder. E.g. a path
     * of /uk will expect the pressed.json stubbed file to be located under folder stubbedFolder/uk
     */
    public void withResponse(String stubbedResponseFilePath) {
        LOG.debug("Creating pressed.json stub using file: "+stubbedResponseFilePath);
        stubFor(mappingBuilder.willReturn(aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                .withBody(IoUtils.loadPressedJsonStubFile(path, stubbedResponseFilePath))));
    }

}
