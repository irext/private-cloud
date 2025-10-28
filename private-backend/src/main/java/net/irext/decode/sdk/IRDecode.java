package net.irext.decode.sdk;

import net.irext.decode.sdk.bean.ACStatus;
import net.irext.decode.sdk.bean.TemperatureRange;
import net.irext.decode.sdk.utils.Constants;
import net.irext.server.utils.LoggerUtil;

/**
 * Filename:       IRDecode.java
 * Revised:        Date: 2017-04-22
 * Revision:       Revision: 1.0
 * <p>
 * Description:    Wrapper-sdk of IR server
 * <p>
 * Revision log:
 * 2017-04-23: created by strawmanbobi
 */
public class IRDecode {

    private static final String TAG = IRDecode.class.getSimpleName();

    private static final Object mSync = new Object();

    private native String irGetVersion();

    private native int irOpen(int category, int subCate, String fileName);

    private native int irOpenBinary(int category, int subCate, byte[] binaries, int binLength);

    private native int[] irDecode(int keyCode, ACStatus acStatus, int changeWindDirection);

    private native void irClose();

    private native int[] irDecodeCombo(int category, int subCate, byte[] binaries, int binLength,
                                       int keyCode, ACStatus acStatus, int changeWindDirection);

    private native TemperatureRange irACGetTemperatureRange(int acMode);

    private native int irACGetSupportedMode();

    private native int irACGetSupportedWindSpeed(int acMode);

    private native int irACGetSupportedSwing(int acMode);

    private native int irACGetSupportedWindDirection(int acMode);

    private static IRDecode mInstance;

    public static IRDecode getInstance() {
        if (null == mInstance) {
            mInstance = new IRDecode();
        }
        return mInstance;
    }

    private IRDecode() {
        String libPath = "/data/irext/libirdecode_jni.so";
        LoggerUtil.getInstance().trace(TAG, "loading server library " + libPath);
        System.load(libPath);
    }

    public String getVersion() {
        return irGetVersion();
    }

    public int openFile(int category, int subCate, String fileName) {
        return irOpen(category, subCate, fileName);
    }

    public int openBinary(int category, int subCate, byte[] binaries, int binLength) {
        return irOpenBinary(category, subCate, binaries, binLength);
    }

    public int[] decodeBinary(int keyCode, ACStatus acStatus, int changeWindDir) {
        int[] decoded;
        synchronized (mSync) {
            acStatus = ensureACStatus(acStatus, keyCode);
            decoded = irDecode(keyCode, acStatus, changeWindDir);
        }
        return decoded;
    }

    public int[] decodeBinary(int category, int subCate, byte[] binaries, int binLength,
            int keyCode, ACStatus acStatus, int changeWindDir) {
        int[] decoded;
        synchronized (mSync) {
            acStatus = ensureACStatus(acStatus, keyCode);
            decoded = irDecodeCombo(category, subCate, binaries, binLength,
                    keyCode, acStatus, changeWindDir);
        }
        return decoded;
    }

    public void closeBinary() {
        irClose();
    }

    public TemperatureRange getTemperatureRange(int acMode) {
        LoggerUtil.getInstance().trace(TAG, "getTemperatureRange");

        TemperatureRange temperatureRange = irACGetTemperatureRange(acMode);

        LoggerUtil.getInstance().trace(TAG, "getTemperatureRange DONE " +
                temperatureRange.getTempMin() + ", " + temperatureRange.getTempMax());

        return temperatureRange;
    }

    public int[] getACSupportedMode() {
        // cool, heat, auto, fan, de-humidification
        int[] retSupportedMode = {0, 0, 0, 0, 0};

        LoggerUtil.getInstance().trace(TAG, "getACSupportedMode");
        int supportedMode = irACGetSupportedMode();
        LoggerUtil.getInstance().trace(TAG, "getACSupportedMode DONE " + supportedMode);

        for (int i = Constants.ACMode.MODE_COOL.getValue(); i <=
                Constants.ACMode.MODE_DEHUMIDITY.getValue(); i++) {
            retSupportedMode[i] = (supportedMode >>> 1) & 1;
        }
        return retSupportedMode;
    }

    public int[] getACSupportedWindSpeed(int acMode) {
        // auto, low, medium, high
        int[] retSupportedWindSpeed = {0, 0, 0, 0};
        int supportedWindSpeed = irACGetSupportedWindSpeed(acMode);
        for (int i = Constants.ACWindSpeed.SPEED_AUTO.getValue();
             i <= Constants.ACWindSpeed.SPEED_HIGH.getValue();
             i++) {
            retSupportedWindSpeed[i] = (supportedWindSpeed >>> 1) & 1;
        }
        return retSupportedWindSpeed;
    }

    public int[] getACSupportedSwing(int acMode) {
        // swing-on, swing-off
        int[] retSupportedSwing = {0, 0};
        int supportedSwing = irACGetSupportedSwing(acMode);
        for (int i = Constants.ACSwing.SWING_ON.getValue();
             i <= Constants.ACSwing.SWING_OFF.getValue();
             i++) {
            retSupportedSwing[i] = (supportedSwing >>> 1) & 1;
        }
        return retSupportedSwing;
    }

    public int getACSupportedWindDirection(int acMode) {
        // how many directions supported by specific AC
        return irACGetSupportedWindDirection(acMode);
    }

    private ACStatus ensureACStatus(ACStatus acStatus, int keyCode) {
        if (null == acStatus) {
            LoggerUtil.getInstance().trace(TAG, "AC Status is null, create a default one");
            acStatus = new ACStatus();
        } else {
            LoggerUtil.getInstance().trace(TAG, "AC Status = " +
                    acStatus.getAcPower() + ", " + acStatus.getAcMode() +
                    ", " + acStatus.getAcTemp() + ", " + acStatus.getAcWindSpeed() +
                    ", " + acStatus.getAcWindDir() + ", keyCode = " + keyCode);
        }
        return acStatus;
    }
}
