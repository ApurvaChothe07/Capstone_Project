import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
                navigate("/interview");
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
        <>
{/*         <pre> */}
{/*             {JSON.stringify(candidate, null, 2)} */}
{/*         </pre> */}
        <div>
           <h1>Candidate Registration Form</h1>


            <form onSubmit={handleSubmit}>

                {/* Email */}
                <div>
                    <label>Email:</label><br />
                    <input
                        type="email"
                        name="email"
                        value={candidate.email}
                        onChange={handleChange}
                    />
                    <p style={{color:"red"}}>
                        {errors.email}
                    </p>
                </div>

                <br />

                {/* Name */}
                <div>
                    <label>Name:</label><br />
                    <input
                        type="text"
                        name="name"
                        value={candidate.name}
                        onChange={handleChange}
                    />
                    <p style={{color:"red"}}>
                        {errors.name}
                    </p>
                </div>

                <br />

                {/* Gender */}
                <div>
                    <label>Gender:</label><br />

                    <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={candidate.gender==="Male"}
                        onChange={handleChange}
                    />
                    Male
                    <p style={{color:"red"}}>
                        {errors.gender}
                    </p>

                    <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={candidate.gender==="Female"}
                        onChange={handleChange}
                    />
                    Female
                    <p style={{color:"red"}}>
                        {errors.gender}
                    </p>

                    <input
                        type="radio"
                        name="gender"
                        value="Other"
                        checked={candidate.gender==="Other"}
                        onChange={handleChange}
                    />
                    Other
                    <p style={{color:"red"}}>
                        {errors.gender}
                    </p>
                </div>

                <br />

                {/* Age */}
                <div>
                    <label>Age:</label><br />
                    <input
                        type="number"
                        name="age"
                        value={candidate.age}
                        onChange={handleChange}
                    />
                    <p style={{color:"red"}}>
                        {errors.age}
                    </p>
                </div>

                <br />

                {/* Class */}
                <div>
                    <label>Class:</label><br />

                    <select
                        name="classYear"
                        value={candidate.classYear}
                        onChange={handleChange}
                    >

                        <option value="">
                            Select Class
                        </option>
                        <option>S.Y. B.Tech</option>
                        <option>T.Y. B.Tech</option>
                        <option>Final Year B.Tech</option>
                        <option>Diploma</option>
                        <option>MCA</option>
                        <option>BCA</option>
                    </select>
                    <p style={{color:"red"}}>
                                            {errors.classYear}
                    </p>
                </div>

                <br />

                {/* Department */}
                <div>
                    <label>Department:</label><br />

                    <select
                        name="department"
                        value={candidate.department}
                        onChange={handleChange}
                    >

                        <option value="">
                            Select Department
                        </option>
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
                    <p style={{color:"red"}}>
                        {errors.department}
                    </p>
                </div>

                <br />

                {/* Address */}
                <div>
                    <label>Address:</label><br />
                    <textarea
                        rows="3"
                        name="address"
                        value={candidate.address}
                        onChange={handleChange}
                    />
                </div>

                <br />

                {/* SSC Marks */}
                <div>
                    <label>SSC Marks (%):</label><br />
                    <input
                        type="number"
                        name="sscMarks"
                        value={candidate.sscMarks}
                        onChange={handleChange}
                    />
                    <p style={{color:"red"}}>
                        {errors.sscMarks}
                    </p>
                </div>

                <br />

                {/* HSC/Diploma Marks */}
                <div>
                    <label>HSC/Diploma Marks (%):</label><br />
                    <input
                        type="number"
                        name="hscOrDiplomaMarks"
                        value={candidate.hscOrDiplomaMarks}
                        onChange={handleChange}
                    />
                    <p style={{color:"red"}}>
                        {errors.hscOrDiplomaMarks}
                    </p>
                </div>

                <br />

                {/* CGPA */}
                <div>
                    <label>CGPA:</label><br />
                    <input
                        type="number"
                        step="0.01"
                        name="cgpa"
                        value={candidate.cgpa}
                        onChange={handleChange}
                    />
                    <p style={{color:"red"}}>
                        {errors.cgpa}
                    </p>
                </div>

                <br />

                {/* Activity Categories */}
                <div>
                    <label>Extra Co-curricular Activities:</label><br />

                   <input
                       type="checkbox"
                       value="Sports"
                       checked={candidate.activityCategories.includes("Sports")}
                       onChange={handleActivityChange}
                   />Sports
                   <p style={{color:"red"}}>
                       {errors.activityCategories}
                   </p>



                   <input
                       type="checkbox"
                       value="Cultural"
                       checked={candidate.activityCategories.includes("Cultural")}
                       onChange={handleActivityChange}
                   /> Cultural


                   <input
                       type="checkbox"
                       value="Technical"
                       checked={candidate.activityCategories.includes("Technical")}
                       onChange={handleActivityChange}
                   />Technical


                   <input
                       type="checkbox"
                       value="Non Technical"
                       checked={candidate.activityCategories.includes("Non Technical")}
                       onChange={handleActivityChange}
                   /> Non Technical


                   <input
                       type="checkbox"
                       value="Other"
                       checked={candidate.activityCategories.includes("Other")}
                       onChange={handleActivityChange}
                   />Other
                </div>

                <br />

                {/* Description */}
                <div>
                    <label>Activity Description:</label><br />
                    <textarea
                        rows="3"
                        name="activityDescription"
                        value={candidate.activityDescription}
                        onChange={handleChange}
                    />
                </div>

                <br />

                {/* Awards */}
                <div>
                    <label>Award Received:</label><br />
                    <textarea
                        rows="3"
                        name="awardReceived"
                        value={candidate.awardReceived}
                        onChange={handleChange}
                    />
                </div>

                <br />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>

                {successMessage && (
                    <p
                        style={{
                            color: "green",
                            fontWeight: "bold",
                            fontSize: "18px"
                        }}
                    >
                        {successMessage}
                    </p>
                )}

            </form>
        </div>
        </>
    );
}

export default CandidateRegistration;