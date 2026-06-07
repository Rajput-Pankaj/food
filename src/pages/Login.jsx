

import {useFormik} from "formik";
import *as Yup from "yup";

export default function Login() {
 const formik=useFormik({
     initialValues:{
      
       email:"",
       password:"",
       
     },

     validateSchema:Yup.object({

       email:Yup.string()
      .min("email is valid format")
      .reqquired("email is required"),

        password:Yup.string()
      .min(8,"Password Atleast 8 characters")
      .required("Password is required"),

 }),

    onSubmit:async(values ,{resetForm})=>{
      try{
        const response=await fetch("",{
          method:"POST",
          headers:{"Content-Type":"appliication/json"},
          body:JSON.stringify(values),

        });

        const data=await response.json();
        console .log("ye rha aapka form ka data",data);

        localStorage.setItem("token",data.token||"pankajtoken");
        alert("SignUp Successfull");

        window.location.href="/Header";
        resetForm();
      } catch(error){
        console.log("form fill krne me tumse koi galti hui ha",error);
        alert("Login failed");
      }
    },
  });




  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login Page</h2>

        <form onSubmit={formik.handleSubmit}>
        <div>
          <input
          name="email"
          type="email"
          placeholder="Enter Your email"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          values={formik.values.email}
          />
          <div>
            {formik.touched.email&&formik.errors.email&&(<p>
              {formik.errors.email}
            </p>)}
          </div>
        </div>


           <div>
          <input
          name="password"
          type="password"
          placeholder="Enter Your Password"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          values={formik.values.password}
          />
          <div>
            {formik.touched.password&&formik.errors.password&&(<p>
              {formik.errors.password}
            </p>)}
          </div>
        </div>
        <button type="submit">Login</button>
        </form>

       
      </div>
    </div>
  );
}