package com.gu.fronts.integration.test.common.util;

import java.io.StringWriter;

import org.apache.commons.io.IOUtils;

public class IoUtils {

    private static final String ROOT_STUBBED_DATA_FOLDER = "stubbedData";

    public static String loadPressedJsonStubFile(String stubbedResponseFilePath, String fileName) {
        return loadResourceFromClassPath(ROOT_STUBBED_DATA_FOLDER + stubbedResponseFilePath + "/" + fileName);
    }

    private static String loadResourceFromClassPath(String classPathResourcePath) {
        try {
            StringWriter stringWriter = new StringWriter();
            IOUtils.copy(IoUtils.class.getClassLoader().getResourceAsStream(classPathResourcePath), stringWriter);
            return stringWriter.toString();
        } catch (Exception e) {
            throw new RuntimeException("Could not load resource: " + classPathResourcePath, e);
        }
    }

}
