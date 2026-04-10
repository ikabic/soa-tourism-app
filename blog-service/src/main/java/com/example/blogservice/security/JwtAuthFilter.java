package com.example.blogservice.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

public class JwtAuthFilter extends OncePerRequestFilter {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private static String getClaimAsString(Map<String, Object> claims, String claimName) {
        Object value = claims.get(claimName);
        if (value == null) {
            return null;
        }

        String converted = value.toString();
        return converted.isBlank() ? null : converted;
    }

    private static Map<String, Object> verifyAndParseJwt(String token, String secret) throws Exception {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Malformed JWT");
        }

        byte[] headerBytes = Base64.getUrlDecoder().decode(parts[0]);
        byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
        byte[] signatureBytes = Base64.getUrlDecoder().decode(parts[2]);

        Map<String, Object> header = OBJECT_MAPPER.readValue(headerBytes, Map.class);
        if (!"HS256".equals(getClaimAsString(header, "alg"))) {
            throw new IllegalArgumentException("Unsupported JWT algorithm");
        }

        String signedPart = parts[0] + "." + parts[1];
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] expectedSignature = mac.doFinal(signedPart.getBytes(StandardCharsets.UTF_8));

        if (!MessageDigest.isEqual(expectedSignature, signatureBytes)) {
            throw new IllegalArgumentException("JWT signature mismatch");
        }

        Map<String, Object> claims = OBJECT_MAPPER.readValue(payloadBytes, Map.class);
        String expClaim = getClaimAsString(claims, "exp");
        if (expClaim != null) {
            long exp = Long.parseLong(expClaim);
            if (exp <= Instant.now().getEpochSecond()) {
                throw new IllegalArgumentException("JWT expired");
            }
        }

        return claims;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Token not provided");
            return;
        }

        String token = authorizationHeader.substring(7);
        String secret = System.getenv("JWT_SECRET");
        if (secret == null || secret.isBlank()) {
            response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value(), "JWT secret is not configured");
            return;
        }

        try {
            Map<String, Object> claims = verifyAndParseJwt(token, secret);
            String userId = getClaimAsString(claims, "userId");
            if (userId == null) {
                userId = getClaimAsString(claims, "sub");
            }
            if (userId == null) {
                response.sendError(HttpStatus.UNAUTHORIZED.value(), "Token does not contain user identity");
                return;
            }

            request.setAttribute("userId", userId);
            request.setAttribute("role", getClaimAsString(claims, "role"));
            filterChain.doFilter(request, response);
        } catch (Exception exception) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Invalid token");
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/blogs");
    }
}
