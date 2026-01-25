package com.todo.service;

import com.todo.entity.User;
import com.todo.repository.UserRepository;
import com.todo.service.impl.UserServiceImpl;
import com.todo.util.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        testUser = TestDataFactory.createTestUser();
        userId = UUID.randomUUID();
        testUser.setId(userId);
    }

    @Test
    void shouldCreateUserSuccessfully() {
        // Given
        String username = "newuser";
        String email = "newuser@example.com";
        String password = "password123";
        String hashedPassword = "$2a$10$hashedpassword";
        
        when(userRepository.existsByUsername(username)).thenReturn(false);
        when(userRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(password)).thenReturn(hashedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(userId);
            return user;
        });

        // When
        User createdUser = userService.createUser(username, email, password, "First", "Last");

        // Then
        assertThat(createdUser).isNotNull();
        assertThat(createdUser.getId()).isEqualTo(userId);
        assertThat(createdUser.getUsername()).isEqualTo(username);
        assertThat(createdUser.getEmail()).isEqualTo(email);
        assertThat(createdUser.getPasswordHash()).isEqualTo(hashedPassword);
        assertThat(createdUser.isActive()).isTrue();
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenUsernameExists() {
        // Given
        String username = "existinguser";
        when(userRepository.existsByUsername(username)).thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> userService.createUser(username, "email@example.com", "password", "First", "Last"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.CONFLICT);
        
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenEmailExists() {
        // Given
        String email = "existing@example.com";
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail(email)).thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> userService.createUser("newuser", email, "password", "First", "Last"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.CONFLICT);
        
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldGetUserById() {
        // Given
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        // When
        User foundUser = userService.getUserById(userId);

        // Then
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getId()).isEqualTo(userId);
        assertThat(foundUser.getUsername()).isEqualTo("testuser");
    }

    @Test
    void shouldThrowExceptionWhenUserNotFoundById() {
        // Given
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> userService.getUserById(userId))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldGetUserByUsername() {
        // Given
        when(userRepository.findByUsernameAndIsActiveTrue("testuser")).thenReturn(Optional.of(testUser));

        // When
        User foundUser = userService.getUserByUsername("testuser");

        // Then
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getUsername()).isEqualTo("testuser");
    }

    @Test
    void shouldThrowExceptionWhenUserNotFoundByUsername() {
        // Given
        when(userRepository.findByUsernameAndIsActiveTrue("nonexistent")).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> userService.getUserByUsername("nonexistent"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldGetUserByEmail() {
        // Given
        when(userRepository.findByEmailAndIsActiveTrue("test@example.com")).thenReturn(Optional.of(testUser));

        // When
        User foundUser = userService.getUserByEmail("test@example.com");

        // Then
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void shouldGetAllUsers() {
        // Given
        User user2 = TestDataFactory.createTestUser("user2", "user2@example.com");
        List<User> users = List.of(testUser, user2);
        when(userRepository.findAll()).thenReturn(users);

        // When
        List<User> result = userService.getAllUsers();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyInAnyOrder(testUser, user2);
    }

    @Test
    void shouldUpdateUserSuccessfully() {
        // Given
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsername("newusername")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User updatedUser = userService.updateUser(userId, "newusername", null, "NewFirst", "NewLast");

        // Then
        assertThat(updatedUser.getUsername()).isEqualTo("newusername");
        assertThat(updatedUser.getFirstName()).isEqualTo("NewFirst");
        assertThat(updatedUser.getLastName()).isEqualTo("NewLast");
        verify(userRepository).save(testUser);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingToExistingUsername() {
        // Given
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsername("existingusername")).thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> userService.updateUser(userId, "existingusername", null, null, null))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void shouldDeactivateUser() {
        // Given
        testUser.setActive(true);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        userService.deactivateUser(userId);

        // Then
        assertThat(testUser.isActive()).isFalse();
        verify(userRepository).save(testUser);
    }

    @Test
    void shouldActivateUser() {
        // Given
        testUser.setActive(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        userService.activateUser(userId);

        // Then
        assertThat(testUser.isActive()).isTrue();
        verify(userRepository).save(testUser);
    }

    @Test
    void shouldCheckUsernameExists() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // When
        boolean exists = userService.existsByUsername("testuser");

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    void shouldCheckEmailExists() {
        // Given
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // When
        boolean exists = userService.existsByEmail("test@example.com");

        // Then
        assertThat(exists).isTrue();
    }
}

