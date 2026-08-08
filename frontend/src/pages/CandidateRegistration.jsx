import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CandidateRegistration.css";

function CandidateRegistration() {

    const [candidate, setCandidate] = useState({
        email: "",
        name: "",
        gender: "",
        age: "",
        classYear: "",
        department: "",
        address: "",
        sscMarks: "",
        hscOrDiplomaMarks: "",
        cgpa: "",
        activityCategories: [],
        activityDescription: "",
        awardReceived: ""
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();


    const handleChange = (e) => {

        const { name, value } = e.target;

        setCandidate({
            ...candidate,
            [name]: value
        });

    };

    const handleActivityChange = (e) => {

        const { value, checked } = e.target;

        let updatedActivities = [...candidate.activityCategories];


        if (checked) {
            updatedActivities.push(value);
        }
        else {
            updatedActivities = updatedActivities.filter(
                (activity) => activity !== value
            );
        }


        setCandidate({
            ...candidate,
            activityCategories: updatedActivities
        });

    };



    const validate = () => {

        let newErrors = {};


        // Email validation
        if (!candidate.email) {
            newErrors.email = "Email is required";
        }
        else if (!/\S+@\S+\.\S+/.test(candidate.email)) {
            newErrors.email = "Enter a valid email";
        }


        // Name validation
        if (!candidate.name) {
            newErrors.name = "Name is required";
        }


        // Gender validation
        if (!candidate.gender) {
            newErrors.gender = "Please select gender";
        }


        // Age validation
        if (candidate.age === "") {
            newErrors.age = "Age is required";
        }
        else if (candidate.age < 18 || candidate.age > 60) {
            newErrors.age = "Age must be between 18 and 60";
        }


        // Class validation
        if (!candidate.classYear) {
            newErrors.classYear = "Please select class";
        }


        // Department validation
        if (!candidate.department) {
            newErrors.department = "Please select department";
        }


        // SSC validation
        if (candidate.sscMarks === "") {
            newErrors.sscMarks = "SSC marks are required";
        }
        else if(candidate.sscMarks < 0 || candidate.sscMarks > 100){
            newErrors.sscMarks = "SSC marks must be between 0 and 100";
        }


        // HSC validation
        if (candidate.hscOrDiplomaMarks === "") {
            newErrors.hscOrDiplomaMarks = "HSC/Diploma marks are required";
        }
        else if(candidate.hscOrDiplomaMarks < 0 || candidate.hscOrDiplomaMarks > 100){
            newErrors.hscOrDiplomaMarks = "Marks must be between 0 and 100";
        }


        // CGPA validation
        if (candidate.cgpa === "") {
            newErrors.cgpa = "CGPA is required";
        }
        else if(candidate.cgpa < 0 || candidate.cgpa > 10){
            newErrors.cgpa = "CGPA must be between 0 and 10";
        }


        // Activity validation
        if(candidate.activityCategories.length === 0){
            newErrors.activityCategories =
            "Select at least one activity";
        }


        setErrors(newErrors);


        return Object.keys(newErrors).length === 0;

    };



   const handleSubmit = async (e) => {

       e.preventDefault();

       if (!validate()) {
           return;
       }

       try {

           setLoading(true);

           const response = await axios.post(
               "http://localhost:8081/candidates",
               candidate
           );

           console.log("Candidate Registered Successfully");
           console.log(response.data);

           setSuccessMessage("Candidate registered successfully!");
           console.log("Success message set");

           localStorage.setItem(
               "candidate",
               JSON.stringify(response.data)
           );

            setTimeout(() => {
                navigate("/welcome");
            }, 3000);

       }
       catch (error) {

           console.error("Registration Failed");
           console.error(error);

       }
       finally {

           setLoading(false);

       }

   };

    return (
        <div className="registration-container">
            <div className="registration-card">
                <h1 className="registration-title">Candidate Registration</h1>

                <form onSubmit={handleSubmit}>
                    
                    {/* SECTION 1: Personal Information */}
                    <div className="form-section">
                        <h2 className="section-title">Personal Information</h2>
                        <div className="form-grid two-cols">
                            
                            {/* Name */}
                            <div className="form-group full-width">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={candidate.name}
                                    onChange={handleChange}
                                    className={errors.name ? "input-error" : ""}
                                    placeholder="Enter your full name"
                                />
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </div>

                            {/* Email */}
                            <div className="form-group full-width">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={candidate.email}
                                    onChange={handleChange}
                                    className={errors.email ? "input-error" : ""}
                                    placeholder="you@example.com"
                                />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>

                            {/* Age */}
                            <div className="form-group">
                                <label>Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={candidate.age}
                                    onChange={handleChange}
                                    className={errors.age ? "input-error" : ""}
                                    placeholder="e.g., 21"
                                />
                                {errors.age && <span className="error-text">{errors.age}</span>}
                            </div>

                            {/* Gender */}
                            <div className="form-group">
                                <label>Gender</label>
                                <div className={`radio-group ${errors.gender ? "input-error" : ""}`}>
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Male"
                                            checked={candidate.gender === "Male"}
                                            onChange={handleChange}
                                        /> Male
                                    </label>
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Female"
                                            checked={candidate.gender === "Female"}
                                            onChange={handleChange}
                                        /> Female
                                    </label>
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Other"
                                            checked={candidate.gender === "Other"}
                                            onChange={handleChange}
                                        /> Other
                                    </label>
                                </div>
                                {errors.gender && <span className="error-text">{errors.gender}</span>}
                            </div>

                            {/* Address */}
                            <div className="form-group full-width">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={candidate.address}
                                    onChange={handleChange}
                                    placeholder="Enter your full residential address"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Academic Details */}
                    <div className="form-section">
                        <h2 className="section-title">Academic Details</h2>
                        
                        <div className="form-grid two-cols">
                            {/* Class */}
                            <div className="form-group">
                                <label>Class / Year</label>
                                <select
                                    name="classYear"
                                    value={candidate.classYear}
                                    onChange={handleChange}
                                    className={errors.classYear ? "input-error" : ""}
                                >
                                    <option value="">Select Class</option>
                                    <option>S.Y. B.Tech</option>
                                    <option>T.Y. B.Tech</option>
                                    <option>Final Year B.Tech</option>
                                    <option>Diploma</option>
                                    <option>MCA</option>
                                    <option>BCA</option>
                                </select>
                                {errors.classYear && <span className="error-text">{errors.classYear}</span>}
                            </div>

                            {/* Department */}
                            <div className="form-group">
                                <label>Department</label>
                                <select
                                    name="department"
                                    value={candidate.department}
                                    onChange={handleChange}
                                    className={errors.department ? "input-error" : ""}
                                >
                                    <option value="">Select Department</option>
                                    <option>CSE</option>
                                    <option>CS-IT</option>
                                    <option>AI-ML</option>
                                    <option>ENTC</option>
                                    <option>Electrical</option>
                                    <option>Mechanical</option>
                                    <option>Civil</option>
                                    <option>Robotics</option>
                                    <option>Mechatronics</option>
                                </select>
                                {errors.department && <span className="error-text">{errors.department}</span>}
                            </div>
                        </div>

                        <div className="form-grid" style={{ marginTop: '1.5rem' }}>
                            {/* SSC Marks */}
                            <div className="form-group">
                                <label>SSC Marks (%)</label>
                                <input
                                    type="number"
                                    name="sscMarks"
                                    value={candidate.sscMarks}
                                    onChange={handleChange}
                                    className={errors.sscMarks ? "input-error" : ""}
                                    placeholder="e.g. 85"
                                />
                                {errors.sscMarks && <span className="error-text">{errors.sscMarks}</span>}
                            </div>

                            {/* HSC/Diploma Marks */}
                            <div className="form-group">
                                <label>HSC / Diploma (%)</label>
                                <input
                                    type="number"
                                    name="hscOrDiplomaMarks"
                                    value={candidate.hscOrDiplomaMarks}
                                    onChange={handleChange}
                                    className={errors.hscOrDiplomaMarks ? "input-error" : ""}
                                    placeholder="e.g. 80"
                                />
                                {errors.hscOrDiplomaMarks && <span className="error-text">{errors.hscOrDiplomaMarks}</span>}
                            </div>

                            {/* CGPA */}
                            <div className="form-group">
                                <label>Current CGPA</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="cgpa"
                                    value={candidate.cgpa}
                                    onChange={handleChange}
                                    className={errors.cgpa ? "input-error" : ""}
                                    placeholder="e.g. 8.5"
                                />
                                {errors.cgpa && <span className="error-text">{errors.cgpa}</span>}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Extracurricular Activities */}
                    <div className="form-section">
                        <h2 className="section-title">Extracurricular Activities</h2>
                        
                        {/* Activity Categories */}
                        <div className="form-group full-width">
                            <label>Select Activity Categories</label>
                            <div className={`checkbox-group ${errors.activityCategories ? "input-error" : ""}`}>
                                <label className="checkbox-option">
                                    <input
                                        type="checkbox"
                                        value="Sports"
                                        checked={candidate.activityCategories.includes("Sports")}
                                        onChange={handleActivityChange}
                                    /> Sports
                                </label>
                                <label className="checkbox-option">
                                    <input
                                        type="checkbox"
                                        value="Cultural"
                                        checked={candidate.activityCategories.includes("Cultural")}
                                        onChange={handleActivityChange}
                                    /> Cultural
                                </label>
                                <label className="checkbox-option">
                                    <input
                                        type="checkbox"
                                        value="Technical"
                                        checked={candidate.activityCategories.includes("Technical")}
                                        onChange={handleActivityChange}
                                    /> Technical
                                </label>
                                <label className="checkbox-option">
                                    <input
                                        type="checkbox"
                                        value="Non Technical"
                                        checked={candidate.activityCategories.includes("Non Technical")}
                                        onChange={handleActivityChange}
                                    /> Non Technical
                                </label>
                                <label className="checkbox-option">
                                    <input
                                        type="checkbox"
                                        value="Other"
                                        checked={candidate.activityCategories.includes("Other")}
                                        onChange={handleActivityChange}
                                    /> Other
                                </label>
                            </div>
                            {errors.activityCategories && <span className="error-text">{errors.activityCategories}</span>}
                        </div>

                        <div className="form-grid" style={{ marginTop: '1.5rem' }}>
                            {/* Description */}
                            <div className="form-group">
                                <label>Activity Description</label>
                                <textarea
                                    name="activityDescription"
                                    value={candidate.activityDescription}
                                    onChange={handleChange}
                                    placeholder="Describe your involvement..."
                                />
                            </div>

                            {/* Awards */}
                            <div className="form-group">
                                <label>Awards Received (if any)</label>
                                <textarea
                                    name="awardReceived"
                                    value={candidate.awardReceived}
                                    onChange={handleChange}
                                    placeholder="List any awards or recognition..."
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? "Registering Candidate..." : "Complete Registration"}
                    </button>

                    {successMessage && (
                        <div className="success-message">
                            ✓ {successMessage}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default CandidateRegistration;