package com.todo.service;

import com.todo.api.dto.AuthResponse;
import com.todo.entity.User;
import com.todo.service.impl.AuthServiceImpl;
import com.todo.util.JwtUtil;
import com.todo.util.TestDataFactory;
import com.todo.web.dto.LoginRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;
    private UUID userId;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = TestDataFactory.createTestUser();
        userId = UUID.randomUUID();
        testUser.setId(userId);
        loginRequest = TestDataFactory.createLoginRequest();
    }

    @Test
    void shouldLoginSuccessfullyWithValidCredentials() {
        // Given
        when(userService.getUserByUsername("testuser")).thenReturn(testUser);
        when(passwordEncoder.matches("password123", testUser.getPasswordHash())).thenReturn(true);
        when(jwtUtil.generateToken("testuser", userId.toString())).thenReturn("mock-jwt-token");

        // When
        AuthResponse response = authService.login(loginRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock-jwt-token");
        assertThat(response.getUserId()).isEqualTo(userId);
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getType()).isEqualTo("Bearer");
        verify(jwtUtil).generateToken("testuser", userId.toString());
    }

    @Test
    void shouldLoginWithEmail() {
        // Given
        LoginRequest emailLoginRequest = TestDataFactory.createLoginRequest("test@example.com", "password123");
        when(userService.getUserByUsername("test@example.com"))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));
        when(userService.getUserByEmail("test@example.com")).thenReturn(testUser);
        when(passwordEncoder.matches("password123", testUser.getPasswordHash())).thenReturn(true);
        when(jwtUtil.generateToken("testuser", userId.toString())).thenReturn("mock-jwt-token");

        // When
        AuthResponse response = authService.login(emailLoginRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock-jwt-token");
        verify(userService).getUserByEmail("test@example.com");
    }

    @Test
    void shouldThrowExceptionWithInvalidPassword() {
        // Given
        when(userService.getUserByUsername("testuser")).thenReturn(testUser);
        when(passwordEncoder.matches("wrongpassword", testUser.getPasswordHash())).thenReturn(false);

        LoginRequest invalidRequest = TestDataFactory.createLoginRequest("testuser", "wrongpassword");

        // When/Then
        assertThatThrownBy(() -> authService.login(invalidRequest))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void shouldThrowExceptionWithInvalidUsername() {
        // Given
        when(userService.getUserByUsername("invaliduser"))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));
        when(userService.getUserByEmail("invaliduser"))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

        LoginRequest invalidRequest = TestDataFactory.createLoginRequest("invaliduser", "password123");

        // When/Then
        assertThatThrownBy(() -> authService.login(invalidRequest))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void shouldThrowExceptionWhenUserIsDeactivated() {
        // Given
        testUser.setActive(false);
        when(userService.getUserByUsername("testuser")).thenReturn(testUser);
        when(passwordEncoder.matches("password123", testUser.getPasswordHash())).thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void shouldGetCurrentUserWithValidToken() {
        // Given
        String token = "valid-token";
        when(jwtUtil.extractUsername(token)).thenReturn("testuser");
        when(jwtUtil.extractUserId(token)).thenReturn(userId.toString());
        when(jwtUtil.validateToken(token, "testuser")).thenReturn(true);
        when(userService.getUserById(userId)).thenReturn(testUser);
        when(jwtUtil.extractExpiration(token)).thenReturn(java.util.Date.from(java.time.Instant.now()));

        // When
        AuthResponse response = authService.getCurrentUser(token);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo(token);
        assertThat(response.getUserId()).isEqualTo(userId);
        assertThat(response.getUsername()).isEqualTo("testuser");
        verify(jwtUtil).validateToken(token, "testuser");
    }

    @Test
    void shouldThrowExceptionWithInvalidToken() {
        // Given
        String token = "invalid-token";
        when(jwtUtil.extractUsername(token)).thenReturn("testuser");
        when(jwtUtil.extractUserId(token)).thenReturn(userId.toString());
        when(jwtUtil.validateToken(token, "testuser")).thenReturn(false);

        // When/Then
        assertThatThrownBy(() -> authService.getCurrentUser(token))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void shouldThrowExceptionWhenTokenExtractionFails() {
        // Given
        String token = "malformed-token";
        when(jwtUtil.extractUsername(token)).thenThrow(new RuntimeException("Invalid token"));

        // When/Then
        assertThatThrownBy(() -> authService.getCurrentUser(token))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}

