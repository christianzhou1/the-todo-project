package com.todo.service;

import com.todo.entity.User;

import java.util.List;
import java.util.UUID;

public interface UserService {
    User createUser(String username, String email, String password, String firstName, String lastName);
    User getUserById(UUID id);
    User getUserByUsername(String username);
    User getUserByEmail(String email);
    List<User> getAllUsers();
    User updateUser(UUID id, String username, String email, String firstName, String lastName);
    void deactivateUser(UUID id);
    void activateUser(UUID id);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
