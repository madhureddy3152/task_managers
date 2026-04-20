package com.example.smarttaskmanager.service;

import com.example.smarttaskmanager.entity.Task;
import com.example.smarttaskmanager.entity.User;
import com.example.smarttaskmanager.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getTasks(User user, String statusFilter) {
        if (statusFilter == null || statusFilter.isBlank()) {
            return taskRepository.findByUserOrderByStatusDescIdDesc(user);
        }
        return taskRepository.findByUserAndStatusOrderByIdDesc(user, statusFilter);
    }

    public Task createTask(User user, String title, String description, String status, String priority, String dueDate) {
        Task task = new Task(
            title, 
            description, 
            status == null || status.isBlank() ? "Pending" : status,
            priority == null || priority.isBlank() ? "Medium" : priority,
            dueDate,
            user
        );
        return taskRepository.save(task);
    }

    public Optional<Task> getTask(Long id) {
        return taskRepository.findById(id);
    }

    public Task updateTask(Task existing, String title, String description, String status, String priority, String dueDate) {
        existing.setTitle(title);
        existing.setDescription(description);
        existing.setStatus(status);
        existing.setPriority(priority);
        existing.setDueDate(dueDate);
        return taskRepository.save(existing);
    }

    public void deleteTask(Task task) {
        taskRepository.delete(task);
    }
}
