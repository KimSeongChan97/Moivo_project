package com.example.demo.jwt.controller;

import com.example.demo.jwt.service.RefreshTokenService;
import com.example.demo.jwt.util.JwtUtil;
import com.example.demo.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class LoginController {
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RefreshTokenService refreshTokenService;

    // Access 토큰 재발급 API
    @PostMapping("/token/refresh")
    public ResponseEntity<?> refreshAccessToken(HttpServletRequest request) {
        String refreshToken = request.getHeader("Authorization").replace("Bearer ", "");

        if (!jwtUtil.validateToken(refreshToken)) {
            return ResponseEntity.status(401).body("토큰이 유효하지 않습니다.");
        }

        if (refreshTokenService.isTokenBlacklisted(refreshToken)) {
            return ResponseEntity.status(401).body("블랙리스트에 등록된 토큰입니다.");
        }

        String userId = jwtUtil.getUserIdFromToken(refreshToken);
        int id = jwtUtil.getIdFromToken(refreshToken);
        boolean isAdmin = jwtUtil.getIsAdminFromToken(refreshToken);

        String newAccessToken = jwtUtil.generateAccessToken(userId, id, isAdmin);

        return ResponseEntity.ok(Map.of(
                "newAccessToken", newAccessToken,
                "isAdmin", isAdmin));
    }

}
