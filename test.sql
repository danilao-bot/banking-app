
-- =========================================
-- VERITAS UNIVERSITY DATABASE MANAGEMENT SYSTEM
-- CSC 304 - DBMS PROJECT
-- GROUP 5
-- =========================================

-- =========================
-- FACULTY TABLE
-- =========================
CREATE TABLE Faculty (
    Faculty_ID SERIAL PRIMARY KEY,
    Faculty_Name VARCHAR(100) NOT NULL UNIQUE
);

-- =========================
-- DEPARTMENT TABLE
-- =========================
CREATE TABLE Department (
    Department_ID SERIAL PRIMARY KEY,
    Department_Name VARCHAR(100) NOT NULL UNIQUE,
    Faculty_ID INT NOT NULL,
    
    CONSTRAINT fk_faculty
    FOREIGN KEY (Faculty_ID)
    REFERENCES Faculty(Faculty_ID)
);

-- =========================
-- PROGRAMME TABLE
-- =========================
CREATE TABLE Programme (
    Programme_ID SERIAL PRIMARY KEY,
    Programme_Name VARCHAR(100) NOT NULL,
    Department_ID INT NOT NULL,

    CONSTRAINT fk_department
    FOREIGN KEY (Department_ID)
    REFERENCES Department(Department_ID)
);

-- =========================
-- STUDENT TABLE
-- =========================
CREATE TABLE Student (
    Student_ID SERIAL PRIMARY KEY,
    Student_Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Level VARCHAR(20) NOT NULL,
    Programme_ID INT NOT NULL,

    CONSTRAINT fk_programme
    FOREIGN KEY (Programme_ID)
    REFERENCES Programme(Programme_ID)
);

-- =========================
-- LECTURER TABLE
-- =========================
CREATE TABLE Lecturer (
    Lecturer_ID SERIAL PRIMARY KEY,
    Lecturer_Name VARCHAR(100) NOT NULL,
    Staff_ID VARCHAR(50) UNIQUE NOT NULL,
    Department_ID INT NOT NULL,

    CONSTRAINT fk_lecturer_department
    FOREIGN KEY (Department_ID)
    REFERENCES Department(Department_ID)
);

-- =========================
-- COURSE TABLE
-- =========================
CREATE TABLE Course (
    Course_ID SERIAL PRIMARY KEY,
    Course_Code VARCHAR(20) UNIQUE NOT NULL,
    Course_Title VARCHAR(100) NOT NULL,
    Credit_Unit INT NOT NULL,
    Programme_ID INT NOT NULL,
    Lecturer_ID INT NOT NULL,

    CONSTRAINT fk_course_programme
    FOREIGN KEY (Programme_ID)
    REFERENCES Programme(Programme_ID),

    CONSTRAINT fk_course_lecturer
    FOREIGN KEY (Lecturer_ID)
    REFERENCES Lecturer(Lecturer_ID)
);

-- =========================
-- SEMESTER TABLE
-- =========================
CREATE TABLE Semester (
    Semester_ID SERIAL PRIMARY KEY,
    Session VARCHAR(20) NOT NULL,
    Semester_Name VARCHAR(50) NOT NULL
);

-- =========================
-- REGISTRATION TABLE
-- =========================
CREATE TABLE Registration (
    Registration_ID SERIAL PRIMARY KEY,
    Student_ID INT NOT NULL,
    Course_ID INT NOT NULL,
    Semester_ID INT NOT NULL,
    Grade INT CHECK (Grade >= 0 AND Grade <= 100),

    CONSTRAINT fk_registration_student
    FOREIGN KEY (Student_ID)
    REFERENCES Student(Student_ID),

    CONSTRAINT fk_registration_course
    FOREIGN KEY (Course_ID)
    REFERENCES Course(Course_ID),

    CONSTRAINT fk_registration_semester
    FOREIGN KEY (Semester_ID)
    REFERENCES Semester(Semester_ID)
);

-- =========================================
-- SAMPLE DATA INSERTION
-- =========================================

-- FACULTY
INSERT INTO Faculty (Faculty_Name)
VALUES
('Faculty of Natural and Applied Sciences'),
('Faculty of Engineering');

-- DEPARTMENT
INSERT INTO Department (Department_Name, Faculty_ID)
VALUES
('Computer Science', 1),
('Software Engineering', 1),
('Electrical Engineering', 2);

-- PROGRAMME
INSERT INTO Programme (Programme_Name, Department_ID)
VALUES
('BSc Computer Science', 1),
('BSc Software Engineering', 2),
('BEng Electrical Engineering', 3);

-- STUDENTS
INSERT INTO Student (Student_Name, Email, Level, Programme_ID)
VALUES
('Daniel Eugene', 'daniel@veritas.edu.ng', '300 Level', 1),
('Fidel Chukwuma', 'fidel@veritas.edu.ng', '300 Level', 1),
('Nina Sikari', 'nina@veritas.edu.ng', '200 Level', 2),
('Joshua Aaron', 'joshua@veritas.edu.ng', '400 Level', 1),
('Johnpaul Okoye', 'johnpaul@veritas.edu.ng', '100 Level', 3);

-- LECTURERS
INSERT INTO Lecturer (Lecturer_Name, Staff_ID, Department_ID)
VALUES
('Mr. Onoja', 'VUL001', 1),
('Dr. Musa', 'VUL002', 2),
('Prof. Adewale', 'VUL003', 3);

-- COURSES
INSERT INTO Course (Course_Code, Course_Title, Credit_Unit, Programme_ID, Lecturer_ID)
VALUES
('CSC304', 'Database Management Systems', 3, 1, 1),
('CSC301', 'Operating Systems', 3, 1, 1),
('SEN201', 'Software Design', 2, 2, 2),
('EEE101', 'Circuit Analysis', 3, 3, 3),
('CSC305', 'Computer Networks', 3, 1, 1);

-- SEMESTER
INSERT INTO Semester (Session, Semester_Name)
VALUES
('2025/2026', 'First Semester');

-- REGISTRATIONS
INSERT INTO Registration (Student_ID, Course_ID, Semester_ID, Grade)
VALUES
(1, 1, 1, 85),
(1, 2, 1, 78),
(2, 1, 1, 74),
(2, 5, 1, 81),
(3, 3, 1, 69),
(4, 1, 1, 88),
(4, 2, 1, 73),
(4, 5, 1, 91),
(5, 4, 1, 65),
(3, 1, 1, 72);

-- =========================================
-- SAMPLE QUERIES
-- =========================================

-- 1. Retrieve all students in a particular programme
SELECT Student_Name, Level
FROM Student
WHERE Programme_ID = 1;

-- 2. Retrieve courses taught by a specific lecturer
SELECT Course_Title
FROM Course
WHERE Lecturer_ID = 1;

-- 3. Display students and the courses they registered for
SELECT 
    Student.Student_Name,
    Course.Course_Title
FROM Registration
JOIN Student 
ON Registration.Student_ID = Student.Student_ID
JOIN Course
ON Registration.Course_ID = Course.Course_ID;

-- 4. Calculate total credit units per student
SELECT
    Student.Student_Name,
    SUM(Course.Credit_Unit) AS Total_Credit_Units
FROM Registration
JOIN Student
ON Registration.Student_ID = Student.Student_ID
JOIN Course
ON Registration.Course_ID = Course.Course_ID
GROUP BY Student.Student_Name;

-- 5. Display students who scored above 70
SELECT
    Student.Student_Name,
    Registration.Grade
FROM Registration
JOIN Student
ON Registration.Student_ID = Student.Student_ID
WHERE Registration.Grade > 70;

-- 6. Count number of students per department
SELECT
    Department.Department_Name,
    COUNT(Student.Student_ID) AS Total_Students
FROM Student
JOIN Programme
ON Student.Programme_ID = Programme.Programme_ID
JOIN Department
ON Programme.Department_ID = Department.Department_ID
GROUP BY Department.Department_Name;

-- 7. Show all courses offered in a given semester
SELECT
    Course.Course_Title,
    Semester.Semester_Name
FROM Registration
JOIN Course
ON Registration.Course_ID = Course.Course_ID
JOIN Semester
ON Registration.Semester_ID = Semester.Semester_ID
WHERE Semester.Semester_Name = 'First Semester';

