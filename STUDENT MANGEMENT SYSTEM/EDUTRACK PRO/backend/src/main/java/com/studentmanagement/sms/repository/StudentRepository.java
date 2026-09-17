package com.studentmanagement.sms.repository;

import com.studentmanagement.sms.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for Student entities.
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    /**
     * Find a student by unique Student ID (e.g. STU-1001).
     */
    Optional<Student> findByStudentId(String studentId);

    /**
     * Check if a student ID already exists.
     */
    boolean existsByStudentId(String studentId);

    /**
     * Check if an email is already registered.
     */
    boolean existsByEmail(String email);

    /**
     * Retrieve all student IDs starting with STU- to calculate next sequential ID.
     */
    @Query("SELECT s.studentId FROM Student s WHERE s.studentId LIKE 'STU-%'")
    List<String> findAllFormattedStudentIds();
}
