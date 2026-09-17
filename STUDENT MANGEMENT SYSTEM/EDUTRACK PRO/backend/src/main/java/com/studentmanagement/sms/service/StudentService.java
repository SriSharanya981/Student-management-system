package com.studentmanagement.sms.service;

import com.studentmanagement.sms.exception.ResourceNotFoundException;
import com.studentmanagement.sms.model.Student;
import com.studentmanagement.sms.repository.StudentRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service layer handling Student business logic and validation.
 */
@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;

    // Constructor Injection
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    /**
     * Retrieve all students from the database, ordered newest first.
     */
    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    /**
     * Retrieve a student by database ID.
     */
    @Transactional(readOnly = true)
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
    }

    /**
     * Retrieve a student by custom Student ID (e.g. STU-1001).
     */
    @Transactional(readOnly = true)
    public Student getByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with Student ID: " + studentId));
    }

    /**
     * Create and persist a new Student.
     * Automatically generates unique Student ID (e.g. STU-1001).
     */
    public Student createStudent(Student student) {
        // Validate input data
        validateStudentData(student);

        // Generate studentId if not provided
        if (student.getStudentId() == null || student.getStudentId().trim().isEmpty()) {
            student.setStudentId(generateNextStudentId());
        } else {
            // If studentId was provided, ensure it is unique
            if (studentRepository.existsByStudentId(student.getStudentId())) {
                student.setStudentId(generateNextStudentId());
            }
        }

        return studentRepository.save(student);
    }

    /**
     * Update an existing Student.
     * The student's ID remains unchanged.
     */
    public Student updateStudent(Long id, Student studentDetails) {
        Student existingStudent = getStudentById(id);

        // Validate updated fields
        validateStudentData(studentDetails);

        // Update fields (studentId is preserved)
        existingStudent.setName(studentDetails.getName().trim());
        existingStudent.setDepartment(studentDetails.getDepartment());
        existingStudent.setYear(studentDetails.getYear());
        existingStudent.setEmail(studentDetails.getEmail().trim().toLowerCase());
        existingStudent.setPhone(studentDetails.getPhone().trim());

        return studentRepository.save(existingStudent);
    }

    /**
     * Delete a student by database ID.
     */
    public void deleteStudent(Long id) {
        Student student = getStudentById(id);
        studentRepository.delete(student);
    }

    /**
     * Compute next sequential Student ID (e.g. STU-1001, STU-1002...).
     */
    @Transactional(readOnly = true)
    public synchronized String generateNextStudentId() {
        List<String> formattedIds = studentRepository.findAllFormattedStudentIds();
        int maxId = 1000;

        Pattern pattern = Pattern.compile("STU-(\\d+)");
        for (String idStr : formattedIds) {
            if (idStr != null) {
                Matcher matcher = pattern.matcher(idStr.trim());
                if (matcher.matches()) {
                    try {
                        int num = Integer.parseInt(matcher.group(1));
                        if (num > maxId) {
                            maxId = num;
                        }
                    } catch (NumberFormatException ignored) {
                    }
                }
            }
        }

        return "STU-" + (maxId + 1);
    }

    /**
     * Server-side validation rules.
     */
    private void validateStudentData(Student student) {
        if (student == null) {
            throw new IllegalArgumentException("Student payload cannot be empty");
        }

        // Name Validation
        if (student.getName() == null || student.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Student name is required");
        }
        if (student.getName().matches(".*\\d.*")) {
            throw new IllegalArgumentException("Student name should not contain numbers");
        }

        // Department Validation
        if (student.getDepartment() == null || student.getDepartment().trim().isEmpty()) {
            throw new IllegalArgumentException("Department is required");
        }

        // Year Validation
        if (student.getYear() == null || student.getYear().trim().isEmpty()) {
            throw new IllegalArgumentException("Academic year is required");
        }

        // Email Validation
        if (student.getEmail() == null || student.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        if (!student.getEmail().trim().matches(emailRegex)) {
            throw new IllegalArgumentException("Email must have a valid format");
        }

        // Phone Validation (10 to 15 digits)
        if (student.getPhone() == null || student.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        String cleanPhone = student.getPhone().replaceAll("\\D", "");
        if (cleanPhone.length() < 10 || cleanPhone.length() > 15) {
            throw new IllegalArgumentException("Phone number must contain between 10 and 15 digits");
        }
    }
}
