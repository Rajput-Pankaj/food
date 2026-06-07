
import {useFormik} from "formik";
import *as Yup from "yup";


export default function Signup() {

  const formik=useFormik({
    initialValues:{
      name:"",
      email:"",
      password:"",
      confirmpassword:"",
    },

    validateSchema:Yup.object({
      name:Yup.string()
      .min(8,"Name Atleast 8 characters")
      .required("Name is required"),



       email:Yup.string()
      .min("email is valid format")
      .required("email is required"),



       password:Yup.string()
      .min(8,"Password Atleast 8 characters")
      .required("Password is required"),


       confirmpassword:Yup.string()
      .oneOf([Yup.ref("password"),"Password is match"])
      .required("Name is required"),
    }),

    onSubmit:async(values ,{resetForm})=>{
      try{
        const response=await fetch("",{
          method:"POST",
          headers:{"Content-Type":"appliication/json"},
          body:JSON.stringify(values),

        });

        const data=await response.json();
        console .lof("ye rha aapka form ka data",data);

        localStorage.setItem("token",data.token||"pankajtoken");
        alert("SignUp Successfull");

        window.location.href="/Login"
        resetForm();
      } catch(error){
        console.log("form fill krne me tumse koi galti hui ha",error);
        alert("SignUp failed");
      }
    },
  });



 

   

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Signup Page</h2>

      <form onSubmit={formik.handleSubmit}>
        <div>
          <input
          name="name"
          type="email"
          placeholder="Enter Your Name"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          values={formik.values.name}
          />
          <div>
            {formik.touched.name&&formik.errors.name&&(<p>
              {formik.errors.name}
            </p>)}
          </div>
        </div>




         <div>
          <input
          name="email"
          type="email"
          placeholder="Enter Your Email"
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
         

          <div>
          <input
          name="confirmpassword"
          type="password"
          placeholder="Enter Your ConfirmPassword"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          values={formik.values.confirmpassword}
          />
          <div>
            {formik.touched.confirmpassword &&formik.errors.confirmpassword&&(<p>
              {formik.errors.confirmpassword}
            </p>)}
          </div>
        </div>
        

        <button type="submit">Create Account</button>
      </form>

   
    </div>
  );
}