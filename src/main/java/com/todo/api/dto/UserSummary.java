package com.todo.api.dto;


import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserSummary {
    private UUID id;
    private String username;
    private String firstName;
    private String lastName;
}