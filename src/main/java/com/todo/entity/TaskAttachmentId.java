package com.todo.entity;

import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class TaskAttachmentId implements Serializable {

    private UUID task;
    private UUID attachment;
}
