package com.studentmanagement.sms;

import com.studentmanagement.sms.model.Student;
import com.studentmanagement.sms.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

/**
 * Spring Boot Application Entry Point for Student Management System.
 */
@SpringBootApplication
public class StudentManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentManagementApplication.class, args);
    }

    /**
     * Seeds initial sample students on startup only if the database is currently empty.
     * Prevents duplicate data on server restarts.
     */
    @Bean
    public CommandLineRunner initDatabase(StudentRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Student(
                        "STU-1001",
                        "Rahul Kumar",
                        "CSE",
                        "1st Year",
                        "rahul@gmail.com",
                        "9876543210"
                ));

                repository.save(new Student(
                        "STU-1002",
                        "Priya Sharma",
                        "CSBS",
                        "2nd Year",
                        "priya@gmail.com",
                        "9823456781"
                ));

                repository.save(new Student(
                        "STU-1003",
                        "Arun Kumar",
                        "IT",
                        "3rd Year",
                        "arun@gmail.com",
                        "9765432109"
                ));

                System.out.println(">>> Sample students seeded successfully into MySQL database.");
            } else {
                System.out.println(">>> Database already contains " + repository.count() + " student record(s). Skipping sample data initialization.");
            }
        };
    }
}
