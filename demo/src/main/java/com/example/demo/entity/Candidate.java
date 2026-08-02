package com.example.demo.entity;

import jakarta.persistence.*;
import java.util.List;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "candidates")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Email is required.")
    @Email(message = "Please enter a valid email address.")
    private String email;

    @NotBlank(message = "Name is required.")
    private String name;

    @NotBlank(message = "Gender is required.")
    private String gender;

    @NotNull(message = "Age is required.")
    @Positive(message = "Age must be greater than 0.")
    private Integer age;

    @NotBlank(message = "Class is required.")
    private String classYear;

    @NotBlank(message = "Department is required.")
    private String department;

    @Column(length = 1000)
    private String address;

    @NotNull(message = "SSC Marks are required.")
    @DecimalMin(value = "0.0", message = "SSC Marks cannot be less than 0.")
    @DecimalMax(value = "100.0", message = "SSC Marks cannot exceed 100.")
    private Double sscMarks;


    @NotNull(message = "HSC/Diploma Marks are required.")
    @DecimalMin(value = "0.0", message = "Marks cannot be less than 0.")
    @DecimalMax(value = "100.0", message = "Marks cannot exceed 100.")
    private Double hscOrDiplomaMarks;

    @NotNull(message = "CGPA is required.")
    @DecimalMin(value = "0.0", message = "CGPA cannot be less than 0.")
    @DecimalMax(value = "10.0", message = "CGPA cannot exceed 10.")
    private Double cgpa;

    @NotEmpty(message = "Please select at least one activity.")
    @ElementCollection
    @CollectionTable(
            name = "candidate_activity_categories",
            joinColumns = @JoinColumn(name = "candidate_id")
    )
    @Column(name = "activity_category")
    private List<String> activityCategories;

    @Column(length = 2000)
    private String activityDescription;

    @Column(length = 1000)
    private String awardReceived;

    // Default Constructor
    public Candidate() {
    }

    // Parameterized Constructor
    public Candidate(Long id, String email, String name, String gender,
                     Integer age, String classYear, String department,
                     String address, Double sscMarks,
                     Double hscOrDiplomaMarks, Double cgpa,
                     List<String> activityCategories,
                     String activityDescription,
                     String awardReceived) {

        this.id = id;
        this.email = email;
        this.name = name;
        this.gender = gender;
        this.age = age;
        this.classYear = classYear;
        this.department = department;
        this.address = address;
        this.sscMarks = sscMarks;
        this.hscOrDiplomaMarks = hscOrDiplomaMarks;
        this.cgpa = cgpa;
        this.activityCategories = activityCategories;
        this.activityDescription = activityDescription;
        this.awardReceived = awardReceived;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getClassYear() {
        return classYear;
    }

    public void setClassYear(String classYear) {
        this.classYear = classYear;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getSscMarks() {
        return sscMarks;
    }

    public void setSscMarks(Double sscMarks) {
        this.sscMarks = sscMarks;
    }

    public Double getHscOrDiplomaMarks() {
        return hscOrDiplomaMarks;
    }

    public void setHscOrDiplomaMarks(Double hscOrDiplomaMarks) {
        this.hscOrDiplomaMarks = hscOrDiplomaMarks;
    }

    public Double getCgpa() {
        return cgpa;
    }

    public void setCgpa(Double cgpa) {
        this.cgpa = cgpa;
    }

    public List<String> getActivityCategories() {
        return activityCategories;
    }

    public void setActivityCategories(List<String> activityCategories) {
        this.activityCategories = activityCategories;
    }

    public String getActivityDescription() {
        return activityDescription;
    }

    public void setActivityDescription(String activityDescription) {
        this.activityDescription = activityDescription;
    }

    public String getAwardReceived() {
        return awardReceived;
    }

    public void setAwardReceived(String awardReceived) {
        this.awardReceived = awardReceived;
    }
}