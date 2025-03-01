import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { googleAuth, registerUser, validUser } from '../apis/auth';
import { BsEmojiLaughing, BsEmojiExpressionless } from "react-icons/bs";
import { toast } from 'react-toastify';

const defaultData = {
  firstname: "",
  lastname: "",
  email: "",
  password: ""
};

function Register() {
  const [formData, setFormData] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (formData.email.includes("@") && formData.password.length > 6) {
      const { data } = await registerUser(formData);
      if (data?.token) {
        localStorage.setItem("userToken", data.token);
        toast.success("Successfully Registered 😍");
        navigate("/chats");
      } else {
        toast.error("Invalid Credentials!");
      }
    } else {
      toast.warning("Provide valid Credentials!");
      setFormData({ ...formData, password: "" });
    }
    setIsLoading(false);
  };

  const googleSuccess = async (credentialResponse) => {
    if (credentialResponse?.credential) {
      setIsLoading(true);
      const decoded = jwtDecode(credentialResponse.credential);
      const response = await googleAuth({ tokenId: credentialResponse.credential });
      setIsLoading(false);
      if (response.data.token) {
        localStorage.setItem("userToken", response.data.token);
        navigate("/chats");
      }
    }
  };

  const googleFailure = () => {
    toast.error("Something Went Wrong. Try Again!");
  };

  useEffect(() => {
    const checkValidUser = async () => {
      const data = await validUser();
      if (data?.user) {
        window.location.href = "/chats";
      }
    };
    checkValidUser();
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_CLIENT_ID}>
      <div className='bg-[#121418] w-full h-screen flex justify-center items-center'>
        <div className='w-90% sm:w-400px h-400px relative'>
          <div className='absolute -top-7 left-0'>
            <h3 className='text-25px font-bold tracking-wider text-white'>Register</h3>
            <p className='text-white text-12px tracking-wider font-medium'>
              Have an account? <Link className='text-green-400 underline' to="/login">Sign in</Link>
            </p>
          </div>
          <form className='flex flex-col gap-3 mt-12%' onSubmit={handleOnSubmit}>
            <div className='flex gap-2 w-full'>
              <input onChange={handleOnChange} className='bg-gray-800 h-50px pl-3 text-white w-49%' type="text" name="firstname" placeholder='First Name' value={formData.firstname} required />
              <input onChange={handleOnChange} className='bg-gray-800 h-50px pl-3 text-white w-49%' type="text" name="lastname" placeholder='Last Name' value={formData.lastname} required />
            </div>
            <input onChange={handleOnChange} className='bg-gray-800 h-50px pl-3 text-white w-full' type="email" name="email" placeholder="Email" value={formData.email} required />
            <div className='relative flex flex-col gap-3'>
              <input onChange={handleOnChange} className='bg-gray-800 h-50px pl-3 text-white w-full' type={showPass ? "text" : "password"} name="password" placeholder="Password" value={formData.password} required />
              <button type='button' onClick={() => setShowPass(!showPass)}>
                {showPass ? <BsEmojiExpressionless className='text-white absolute top-3 right-4 w-30px h-25px' /> : <BsEmojiLaughing className='text-white absolute top-3 right-4 w-30px h-25px' />}
              </button>
            </div>
            <button className='w-full h-50px font-bold text-black tracking-wide text-17px' type='submit' style={{ background: "linear-gradient(90deg, rgba(0,195,154,1) 0%, rgba(224,205,115,1) 100%)" }}>
              {isLoading ? "Loading..." : "Register"}
            </button>
            <GoogleLogin onSuccess={googleSuccess} onError={googleFailure} />
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Register;
