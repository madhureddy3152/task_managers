package com.example.smarttaskmanager.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        // Log the actual exception to console for debugging
        ex.printStackTrace();
        
        Map<String, String> response = new HashMap<>();
        response.put("error", "An internal error occurred: " + ex.getMessage());
        return ResponseEntity.internalServerError().body(response);
    }
}
