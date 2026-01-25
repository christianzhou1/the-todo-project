package com.todo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todo.api.dto.AuthResponse;
import com.todo.service.AuthService;
import com.todo.util.JwtUtil;
import com.todo.util.TestDataFactory;
import com.todo.web.dto.LoginRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = AuthController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtUtil jwtUtil;

    private UUID userId;
    private AuthResponse authResponse;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        authResponse = AuthResponse.builder()
                .token("mock-jwt-token")
                .type("Bearer")
                .userId(userId)
                .username("testuser")
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .build();
    }

    @Test
    void shouldLoginSuccessfully() throws Exception {
        // Given
        LoginRequest loginRequest = TestDataFactory.createLoginRequest();
        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        // When/Then
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.userId").value(userId.toString()))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.type").value("Bearer"));

        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    void shouldReturn401OnInvalidCredentials() throws Exception {
        // Given
        LoginRequest loginRequest = TestDataFactory.createLoginRequest("testuser", "wrongpassword");
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.UNAUTHORIZED));

        // When/Then
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());

        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    void shouldGetCurrentUser() throws Exception {
        // Given
        String token = "Bearer mock-jwt-token";
        when(authService.getCurrentUser("mock-jwt-token")).thenReturn(authResponse);

        // When/Then
        mockMvc.perform(get("/auth/me")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.username").value("testuser"));

        verify(authService).getCurrentUser("mock-jwt-token");
    }

    @Test
    void shouldReturn401WhenAuthorizationHeaderMissing() throws Exception {
        // When/Then
        mockMvc.perform(get("/auth/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verify(authService, never()).getCurrentUser(any());
    }

    @Test
    void shouldReturn401WhenAuthorizationHeaderInvalid() throws Exception {
        // When/Then
        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "InvalidFormat token")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verify(authService, never()).getCurrentUser(any());
    }

    @Test
    void shouldLogout() throws Exception {
        // When/Then
        mockMvc.perform(post("/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        // Logout is a no-op on the server side for JWT
    }

    @Test
    void shouldValidateLoginRequest() throws Exception {
        // Given - empty request
        LoginRequest emptyRequest = new LoginRequest();

        // When/Then
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyRequest)))
                .andExpect(status().isBadRequest());

        verify(authService, never()).login(any());
    }
}

