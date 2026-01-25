package com.todo.integration;

import com.todo.entity.User;
import com.todo.repository.UserRepository;
import com.todo.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldCreateUserSuccessfully() {
        // Given
        String username = "testuser";
        String email = "test@example.com";
        String password = "password123";
        String firstName = "Test";
        String lastName = "User";

        // When
        User createdUser = userService.createUser(username, email, password, firstName, lastName);

        // Then
        assertThat(createdUser).isNotNull();
        assertThat(createdUser.getId()).isNotNull();
        assertThat(createdUser.getUsername()).isEqualTo(username);
        assertThat(createdUser.getEmail()).isEqualTo(email);
        assertThat(createdUser.getFirstName()).isEqualTo(firstName);
        assertThat(createdUser.getLastName()).isEqualTo(lastName);
        assertThat(createdUser.isActive()).isTrue();
        assertThat(createdUser.getPasswordHash()).isNotEqualTo(password); // Should be hashed
        assertThat(createdUser.getCreatedAt()).isNotNull();
        assertThat(createdUser.getUpdatedAt()).isNotNull();
    }

    @Test
    void shouldFindUserByUsername() {
        // Given
        User user = userService.createUser("finduser", "find@example.com", "password123", "Find", "User");

        // When
        User foundUser = userService.getUserByUsername("finduser");

        // Then
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getId()).isEqualTo(user.getId());
        assertThat(foundUser.getUsername()).isEqualTo("finduser");
    }

    @Test
    void shouldFindUserByEmail() {
        // Given
        User user = userService.createUser("emailuser", "email@example.com", "password123", "Email", "User");

        // When
        User foundUser = userService.getUserByEmail("email@example.com");

        // Then
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getId()).isEqualTo(user.getId());
        assertThat(foundUser.getEmail()).isEqualTo("email@example.com");
    }

    @Test
    void shouldUpdateUserSuccessfully() {
        // Given
        User user = userService.createUser("updateuser", "update@example.com", "password123", "Update", "User");
        UUID userId = user.getId();

        // When
        User updatedUser = userService.updateUser(userId, "updateduser", "updated@example.com", "Updated", "User");

        // Then
        assertThat(updatedUser.getUsername()).isEqualTo("updateduser");
        assertThat(updatedUser.getEmail()).isEqualTo("updated@example.com");
        assertThat(updatedUser.getFirstName()).isEqualTo("Updated");
        assertThat(updatedUser.getLastName()).isEqualTo("User");
        // Use isAfterOrEqualTo to handle cases where update happens very quickly (same nanosecond)
        assertThat(updatedUser.getUpdatedAt()).isAfterOrEqualTo(user.getUpdatedAt());
    }

    @Test
    void shouldDeactivateUser() {
        // Given
        User user = userService.createUser("deactivateuser", "deactivate@example.com", "password123", "Deactivate", "User");
        UUID userId = user.getId();

        // When
        userService.deactivateUser(userId);

        // Then
        User deactivatedUser = userRepository.findById(userId).orElseThrow();
        assertThat(deactivatedUser.isActive()).isFalse();
    }
}
