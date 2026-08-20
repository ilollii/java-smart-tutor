package server;

import java.io.*;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.*;
import javax.net.ssl.*;

/**
 * SenadEmailService - Universal Real Email Dispatcher for Senad Academic Platform
 * Supports:
 * 1. Resend API (HTTP REST - recommended & instant)
 * 2. SMTP over STARTTLS / SSL (Gmail, Outlook, University SMTP)
 * Zero external libraries required.
 */
public class SenadEmailService {
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Sends an OTP verification email to the student's inbox.
     * Returns true if successfully dispatched via SMTP/Resend API.
     */
    public static boolean sendOtpEmail(String recipientEmail, String recipientName, String otp) {
        String resendApiKey = SmartTutorServer.getEnv("RESEND_API_KEY", "");
        String smtpHost = SmartTutorServer.getEnv("SMTP_HOST", "");
        String smtpUser = SmartTutorServer.getEnv("SMTP_USER", "");
        String smtpPass = SmartTutorServer.getEnv("SMTP_PASS", "");
        int smtpPort = Integer.parseInt(SmartTutorServer.getEnv("SMTP_PORT", "587"));
        String senderEmail = SmartTutorServer.getEnv("SENDER_EMAIL", smtpUser.isEmpty() ? "noreply@senad.imsiu.edu.sa" : smtpUser);

        String subject = "🔒 رمز التحقق الأكاديمي لمنصة سِنَاد (Senad AI): " + otp;
        String htmlBody = buildHtmlEmailTemplate(recipientName, otp);

        // 1. Try Resend API first if configured
        if (resendApiKey != null && !resendApiKey.trim().isEmpty()) {
            boolean success = sendViaResendApi(resendApiKey.trim(), senderEmail, recipientEmail, subject, htmlBody);
            if (success) {
                System.out.println(" [📧] تم إرسال رمز التحقق (" + otp + ") بنجاح إلى: " + recipientEmail + " عبر Resend API");
                return true;
            }
        }

        // 2. Try SMTP if host and credentials are provided
        if (smtpHost != null && !smtpHost.trim().isEmpty() && smtpUser != null && !smtpUser.trim().isEmpty()) {
            boolean success = sendViaSmtp(smtpHost.trim(), smtpPort, smtpUser.trim(), smtpPass.trim(), senderEmail, recipientEmail, subject, htmlBody);
            if (success) {
                System.out.println(" [📧] تم إرسال رمز التحقق (" + otp + ") بنجاح إلى: " + recipientEmail + " عبر SMTP (" + smtpHost + ")");
                return true;
            }
        }

        System.out.println(" [ℹ️] تنبيه: لم يتم ضبط بيانات SMTP/Resend في ملف .env بعد. تم حفظ وتوليد الرمز (" + otp + ") بنجاح.");
        return false;
    }

    /**
     * Sends email via Resend API (HTTP REST)
     */
    private static boolean sendViaResendApi(String apiKey, String from, String to, String subject, String html) {
        try {
            if (from == null || from.isEmpty() || from.contains("localhost") || from.contains("senad.imsiu")) {
                from = "Senad AI Platform <onboarding@resend.dev>";
            }

            StringBuilder json = new StringBuilder("{");
            json.append("\"from\":\"").append(escapeJson(from)).append("\",");
            json.append("\"to\":[\"").append(escapeJson(to)).append("\"],");
            json.append("\"subject\":\"").append(escapeJson(subject)).append("\",");
            json.append("\"html\":\"").append(escapeJson(html)).append("\"");
            json.append("}");

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json.toString(), StandardCharsets.UTF_8))
                    .timeout(Duration.ofSeconds(12))
                    .build();

            HttpResponse<String> resp = HTTP_CLIENT.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (resp.statusCode() == 200 || resp.statusCode() == 201) {
                return true;
            } else {
                System.err.println("Resend API response (" + resp.statusCode() + "): " + resp.body());
                return false;
            }
        } catch (Exception e) {
            System.err.println("Resend API Email error: " + e.getMessage());
            return false;
        }
    }

    /**
     * Sends email via raw Socket SMTP with STARTTLS (Supports Gmail, Outlook, IMSIU)
     */
    private static boolean sendViaSmtp(String host, int port, String user, String pass, String from, String to, String subject, String html) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 10000);
            socket.setSoTimeout(10000);

            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8));

            readSmtpResponse(reader); // 220 greeting

            sendSmtpCommand(writer, "EHLO " + host);
            readSmtpResponse(reader);

            sendSmtpCommand(writer, "STARTTLS");
            String tlsResp = readSmtpResponse(reader);
            if (!tlsResp.startsWith("220")) {
                return false;
            }

            // Upgrade to TLS Socket
            SSLSocketFactory ssf = (SSLSocketFactory) SSLSocketFactory.getDefault();
            SSLSocket sslSocket = (SSLSocket) ssf.createSocket(socket, host, port, true);
            sslSocket.startHandshake();

            BufferedReader tlsReader = new BufferedReader(new InputStreamReader(sslSocket.getInputStream(), StandardCharsets.UTF_8));
            BufferedWriter tlsWriter = new BufferedWriter(new OutputStreamWriter(sslSocket.getOutputStream(), StandardCharsets.UTF_8));

            sendSmtpCommand(tlsWriter, "EHLO " + host);
            readSmtpResponse(tlsReader);

            // AUTH LOGIN
            sendSmtpCommand(tlsWriter, "AUTH LOGIN");
            readSmtpResponse(tlsReader);

            String userB64 = Base64.getEncoder().encodeToString(user.getBytes(StandardCharsets.UTF_8));
            sendSmtpCommand(tlsWriter, userB64);
            readSmtpResponse(tlsReader);

            String passB64 = Base64.getEncoder().encodeToString(pass.getBytes(StandardCharsets.UTF_8));
            sendSmtpCommand(tlsWriter, passB64);
            String authResp = readSmtpResponse(tlsReader);
            if (!authResp.startsWith("235")) {
                System.err.println("SMTP Authentication Failed: " + authResp);
                return false;
            }

            // MAIL FROM & RCPT TO
            sendSmtpCommand(tlsWriter, "MAIL FROM:<" + from + ">");
            readSmtpResponse(tlsReader);

            sendSmtpCommand(tlsWriter, "RCPT TO:<" + to + ">");
            readSmtpResponse(tlsReader);

            sendSmtpCommand(tlsWriter, "DATA");
            readSmtpResponse(tlsReader);

            // Send Headers and Body
            String messageId = "<" + System.currentTimeMillis() + "." + Math.abs(new SecureRandom().nextLong()) + "@senad.ai>";
            tlsWriter.write("From: =?UTF-8?B?" + Base64.getEncoder().encodeToString("منصة سِنَاد الذكية".getBytes(StandardCharsets.UTF_8)) + "?= <" + from + ">\r\n");
            tlsWriter.write("To: <" + to + ">\r\n");
            tlsWriter.write("Subject: =?UTF-8?B?" + Base64.getEncoder().encodeToString(subject.getBytes(StandardCharsets.UTF_8)) + "?=\r\n");
            tlsWriter.write("Message-ID: " + messageId + "\r\n");
            tlsWriter.write("MIME-Version: 1.0\r\n");
            tlsWriter.write("Content-Type: text/html; charset=UTF-8\r\n");
            tlsWriter.write("Content-Transfer-Encoding: 8bit\r\n\r\n");
            tlsWriter.write(html);
            tlsWriter.write("\r\n.\r\n");
            tlsWriter.flush();

            readSmtpResponse(tlsReader);

            sendSmtpCommand(tlsWriter, "QUIT");
            return true;
        } catch (Exception e) {
            System.err.println("SMTP error: " + e.getMessage());
            return false;
        }
    }

    private static void sendSmtpCommand(BufferedWriter writer, String cmd) throws IOException {
        writer.write(cmd + "\r\n");
        writer.flush();
    }

    private static String readSmtpResponse(BufferedReader reader) throws IOException {
        String line = reader.readLine();
        if (line == null) return "";
        while (line.length() >= 4 && line.charAt(3) == '-') {
            line = reader.readLine();
            if (line == null) break;
        }
        return line != null ? line : "";
    }

    /**
     * Builds a luxury, responsive Arabic HTML Email template for the student
     */
    private static String buildHtmlEmailTemplate(String studentName, String otp) {
        String cleanName = (studentName != null && !studentName.trim().isEmpty()) ? studentName.trim() : "عزيزي الطالب";
        return """
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0f1d; color: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 540px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); direction: rtl; text-align: right; }
            .header { text-align: center; margin-bottom: 24px; }
            .badge { display: inline-block; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid #10b981; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .title { font-size: 20px; font-weight: 800; color: #ffffff; margin: 12px 0 6px; }
            .otp-box { background: rgba(16, 185, 129, 0.1); border: 2px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
            .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #34d399; font-family: Consolas, monospace; }
            .info-text { font-size: 14px; line-height: 1.6; color: #94a3b8; }
            .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 11px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="badge">🎓 بوابة سِنَاد Senad للجامعات</span>
              <h1 class="title">رمز التحقق الأكاديمي (2FA)</h1>
            </div>
            
            <p class="info-text">مرحباً بك يا <strong>%s</strong>،</p>
            <p class="info-text">لقد طلبت تسجيل الدخول إلى منصة سِنَاد التعليمية الذكية. يرجى استخدام رمز التحقق التالي لإتمام الدخول:</p>
            
            <div class="otp-box">
              <div class="otp-code">%s</div>
              <div style="font-size: 12px; color: #eab308; margin-top: 8px;">⏳ صالح لمدة 5 دقائق فقط</div>
            </div>
            
            <p class="info-text" style="font-size: 12px; color: #ef4444;">⚠️ تنبيه أمني: لا تشارك هذا الرمز مع أي شخص، فريق سِنَاد لن يطلب منك رمز التحقق أبداً.</p>
            
            <div class="footer">
              منصة سِنَاد (Senad AI) لتعليم البرمجة لطلاب كليات علوم الحاسب وتقنية المعلومات<br/>
              تشفير AES-256 • متوافق مع نظام حماية البيانات الشخصية السعودي (PDPL)
            </div>
          </div>
        </body>
        </html>
        """.formatted(cleanName, otp);
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
