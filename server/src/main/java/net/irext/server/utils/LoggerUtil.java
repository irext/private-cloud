package net.irext.server.utils;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * Filename:       LoggerUtil.java
 * Revised:        Date: 2019-01-01
 * Revision:       Revision: 1.0
 * <p>
 * Description:    Logging util
 * <p>
 * Revision log:
 * 2019-01-01: created by strawmanbobi
 */
public class LoggerUtil {
    private static LoggerUtil loggerUtil;
    private Logger logger;
    private static final int MODE = 0;

    private LoggerUtil() {
        this.logger = LogManager.getLogger(LoggerUtil.class.getSimpleName());
    }

    public static LoggerUtil getInstance() {
        if (null == loggerUtil) {
            loggerUtil = new LoggerUtil();
        }
        return loggerUtil;
    }

    public void trace(String tag, String log) {
        if (0 == MODE) {
            System.out.println("[" + tag + "] " + log);
        } else {
            this.logger.trace("[" + tag + "] " + log);
        }
    }
}
