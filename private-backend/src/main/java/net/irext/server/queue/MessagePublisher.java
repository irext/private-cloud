package net.irext.server.queue;

/**
 * Filename:       MessagePublisher.java
 * Revised:        Date: 2018-12-29
 * Revision:       Revision: 1.0
 * <p>
 * Description:    Message publisher for redis connection
 * <p>
 * Revision log:
 * 2018-12-29: created by strawmanbobi
 */
public interface MessagePublisher {

    void publish(final String message);

}