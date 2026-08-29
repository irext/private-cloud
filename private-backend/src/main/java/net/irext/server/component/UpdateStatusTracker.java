package net.irext.server.component;

import net.irext.server.utils.LoggerUtil;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

/**
 * Filename:       UpdateStatusTracker.java
 * Revised:        Date: 2026-08-29
 * Revision:       Revision: 1.0
 * <p>
 * Description:    SSE event tracker for data update progress
 * <p>
 * Revision log:
 * 2026-08-29: created by strawmanbobi
 */
@Component
public class UpdateStatusTracker {
    private static final String TAG = UpdateStatusTracker.class.getName();

    private SseEmitter emitter;

    public synchronized void registerEmitter(SseEmitter emitter) {
        this.emitter = emitter;
        emitter.onCompletion(() -> {
            LoggerUtil.getInstance().trace(TAG, "SSE emitter completed");
            this.emitter = null;
        });
        emitter.onTimeout(() -> {
            LoggerUtil.getInstance().trace(TAG, "SSE emitter timeout");
            this.emitter = null;
        });
        emitter.onError(e -> {
            LoggerUtil.getInstance().trace(TAG, "SSE emitter error: " + e.getMessage());
            this.emitter = null;
        });
    }

    public synchronized void sendEvent(String step, String status, String message) {
        if (emitter != null) {
            try {
                String json = String.format("{\"step\":\"%s\",\"status\":\"%s\",\"message\":\"%s\"}",
                        step, status, message);
                emitter.send(SseEmitter.event().name("message").data(json));
            } catch (IOException e) {
                LoggerUtil.getInstance().trace(TAG, "failed to send SSE event: " + e.getMessage());
            }
        }
    }

    public synchronized void complete() {
        if (emitter != null) {
            try {
                emitter.complete();
            } catch (Exception e) {
                LoggerUtil.getInstance().trace(TAG, "failed to complete SSE emitter: " + e.getMessage());
            }
            emitter = null;
        }
    }
}
