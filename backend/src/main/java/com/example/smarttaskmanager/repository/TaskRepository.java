package com.example.smarttaskmanager.repository;

import com.example.smarttaskmanager.entity.Task;
import com.example.smarttaskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserOrderByStatusDescIdDesc(User user);
    List<Task> findByUserAndStatusOrderByIdDesc(User user, String status);
}
