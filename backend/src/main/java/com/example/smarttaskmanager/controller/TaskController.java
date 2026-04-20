package com.example.smarttaskmanager.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.smarttaskmanager.dto.TaskRequest;
import com.example.smarttaskmanager.entity.Task;
import com.example.smarttaskmanager.entity.User;
import com.example.smarttaskmanager.service.TaskService;
import com.example.smarttaskmanager.service.UserService;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    private final TaskService taskService;
    private final UserService userService;

    public TaskController(TaskService taskService, UserService userService) {
        this.taskService = taskService;
        this.userService = userService;
    }

    private ResponseEntity<?> validateUserHeader(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "X-User-Id header is required"));
        }
        try {
            Long.valueOf(userIdHeader);
            return ResponseEntity.ok().build();
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID"));
        }
    }

    private User loadUser(String userIdHeader) {
        Long userId = Long.parseLong(userIdHeader);
        return userService.findById(userId).orElse(null);
    }

    @GetMapping
    public ResponseEntity<?> getTasks(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestParam(value = "status", required = false) String status) {
        ResponseEntity<?> validation = validateUserHeader(userIdHeader);
        if (!validation.getStatusCode().is2xxSuccessful()) {
            return validation;
        }
        User user = loadUser(userIdHeader);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        List<Task> tasks = taskService.getTasks(user, status);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<?> createTask(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestBody TaskRequest request) {
        ResponseEntity<?> validation = validateUserHeader(userIdHeader);
        if (!validation.getStatusCode().is2xxSuccessful()) {
            return validation;
        }
        User user = loadUser(userIdHeader);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Task title is required"));
        }
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Task description is required"));
        }
        Task task = taskService.createTask(user, request.getTitle(), request.getDescription(), request.getStatus(), request.getPriority(), request.getDueDate());
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable Long id,
            @RequestBody TaskRequest request) {
        ResponseEntity<?> validation = validateUserHeader(userIdHeader);
        if (!validation.getStatusCode().is2xxSuccessful()) {
            return validation;
        }
        User user = loadUser(userIdHeader);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        return taskService.getTask(id)
                .map(task -> {
                    if (!task.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).body(Map.of("error", "Task does not belong to this user"));
                    }
                    Task updated = taskService.updateTask(task, request.getTitle(), request.getDescription(), request.getStatus(), request.getPriority(), request.getDueDate());
                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Task not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable Long id) {
        ResponseEntity<?> validation = validateUserHeader(userIdHeader);
        if (!validation.getStatusCode().is2xxSuccessful()) {
            return validation;
        }
        User user = loadUser(userIdHeader);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        return taskService.getTask(id)
                .map(task -> {
                    if (!task.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).body(Map.of("error", "Task does not belong to this user"));
                    }
                    taskService.deleteTask(task);
                    return ResponseEntity.ok(Map.of("message", "Task deleted"));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Task not found")));
    }
}
