package com.studentmanagement.sms.controller;

import com.studentmanagement.sms.model.Student;
import com.studentmanagement.sms.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller providing full CRUD endpoints for Student management.
 */
@RestController
@RequestMapping("/api/students")
@CrossOrigin(
    origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://localhost:8080",
        "null",
        "*"
    },
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS
    }
)
public class StudentController {

    private final StudentService studentService;

    // Constructor Injection
    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    /**
     * GET /api/students
     * Retrieve all students from MySQL.
     */
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        List<Student> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    /**
     * GET /api/students/{id}
     * Retrieve a single student by database ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        Student student = studentService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    /**
     * GET /api/students/next-id
     * Returns next available Student ID for frontend auto-generation preview.
     */
    @GetMapping("/next-id")
    public ResponseEntity<Map<String, String>> getNextStudentId() {
        String nextId = studentService.generateNextStudentId();
        Map<String, String> response = new HashMap<>();
        response.put("nextId", nextId);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/students
     * Add a new student to MySQL.
     */
    @PostMapping
    public ResponseEntity<Student> addStudent(@Valid @RequestBody Student student) {
        Student createdStudent = studentService.createStudent(student);
        return new ResponseEntity<>(createdStudent, HttpStatus.CREATED);
    }

    /**
     * PUT /api/students/{id}
     * Update an existing student in MySQL.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody Student studentDetails) {
        Student updatedStudent = studentService.updateStudent(id, studentDetails);
        return ResponseEntity.ok(updatedStudent);
    }

    /**
     * DELETE /api/students/{id}
     * Delete a student from MySQL.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Student deleted successfully");
        return ResponseEntity.ok(response);
    }
}
