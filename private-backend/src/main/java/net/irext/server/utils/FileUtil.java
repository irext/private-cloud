package net.irext.server.utils;

import java.io.*;

/**
 * Filename:       FileUtil.java
 * Revised:        Date: 2017-04-14
 * Revision:       Revision: 1.0
 * <p>
 * Description:    File operations
 * <p>
 * Revision log:
 * 2017-04-14: created by strawmanbobi
 */
@SuppressWarnings("unused")
public class FileUtil {

    public static boolean write(File file, byte[] binaries) {
        if (null == file) {
            return false;
        }

        if (null == binaries) {
            System.out.println("fatal : content to write is null");
            return false;
        }
        FileOutputStream outputStream = null;
        try {
            outputStream = new FileOutputStream(file);
            outputStream.write(binaries, 0, binaries.length);
            outputStream.flush();
            return true;
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (outputStream != null) {
                try {
                    outputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return false;
    }

    public static void createDirs(String path) throws FileNotFoundException {
        File file = new File(path);
        if (!file.exists()) {
            if (!file.mkdir()) {
                throw new FileNotFoundException();
            }
        }
    }

    public static byte[] getByteArrayFromFile(String fileName) {
        File file;
        try {
            file = new File(fileName);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        if (!file.exists() || !file.isFile() || !file.canRead()) {
            return null;
        }

        byte[] byteArray = null;

        try {
            FileInputStream fis = new FileInputStream(file);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            int count;
            byte[] buffer = new byte[512];
            while ((count = fis.read(buffer)) > 0) {
                baos.write(buffer, 0, count);
            }
            byteArray = baos.toByteArray();
            fis.close();
            baos.flush();
            baos.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return byteArray;
    }

    private static void deleteAllFiles(File root) {
        File[] files = root.listFiles();
        if (files != null) {
            for (File f : files) {
                if (f.isDirectory()) {
                    deleteAllFiles(f);
                    try {
                        if (!f.delete()) {
                            System.out.println("failed to delete file");
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                } else {
                    if (f.exists()) {
                        deleteAllFiles(f);
                        try {
                            if (!f.delete()) {
                                System.out.println("failed to delete file");
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        }
    }
}