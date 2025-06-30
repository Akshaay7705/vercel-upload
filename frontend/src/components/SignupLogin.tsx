import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { quantumEncryptor } from '../utils/quantumEncrypt';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';

interface SignupLoginProps {
  onSuccess: () => void;
}

const SignupLogin: React.FC<SignupLoginProps> = ({ onSuccess }) => {
  const PORT = 6060;
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    securityQuestion: '',
    securityAnswer: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password, email, fullName, securityQuestion, securityAnswer } = formData;
    const sessionKey = await quantumEncryptor.getSessionKey();

    const encryptedData = quantumEncryptor.encrypt(
      JSON.stringify({ username, password, email, fullName, securityQuestion, securityAnswer }),
      sessionKey
    );

    try {
      // const response = await fetch(isSignup ? '/api/signup' : '/api/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ encryptedData, sessionKey }),
      // });

      const endpoint = `${import.meta.env.VITE_BACKEND_URI}/api${isSignup ? '/signup' : '/login'}`;
      console.log(endpoint);
      
      axios.post(endpoint, formData)
      .then(({data}) => {
        const res = data.data;
        sessionStorage.setItem('authData', JSON.stringify(res));
        toast.success(data.message || `Successfully ${isSignup ? 'signed up' : 'logged in'}!`);
        onSuccess();
        console.log(res);
      })
      .catch(({response}) => {
        const message = response?.data?.message || 'An unexpected error occurred.';
        toast.error(message);
        console.log(response.data);
        
      })
      
      
    } catch (error) {
      toast.error('An error occurred. Check your connection.');
      console.error(error);
    }
  };

  return (
    <>
       <Toaster position="top-center" />
    
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#E0E0E0] flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white/80 rounded-2xl shadow-lg border border-[#666666]/30 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-[#333333] mb-6 text-center">
          {isSignup ? 'Sign Up' : 'Log In'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white rounded-lg border border-[#666666]/20 focus:border-[#666666] transition-all duration-200 hover:shadow-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white rounded-lg border border-[#666666]/20 focus:border-[#666666] transition-all duration-200 hover:shadow-md"
              required
            />
          </div>
          {isSignup && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white rounded-lg border border-[#666666]/20 focus:border-[#666666] transition-all duration-200 hover:shadow-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white rounded-lg border border-[#666666]/20 focus:border-[#666666] transition-all duration-200 hover:shadow-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">Security Question</label>
                <input
                  type="text"
                  name="securityQuestion"
                  value={formData.securityQuestion}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white rounded-lg border border-[#666666]/20 focus:border-[#666666] transition-all duration-200 hover:shadow-md"
                  placeholder="e.g., What’s your pet’s name?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">Security Answer</label>
                <input
                  type="text"
                  name="securityAnswer"
                  value={formData.securityAnswer}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white rounded-lg border border-[#666666]/20 focus:border-[#666666] transition-all duration-200 hover:shadow-md"
                  required
                />
              </div>
            </>
          )}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-[#666666] text-white rounded-lg hover:bg-[#555555] transition-all duration-300 shadow-md hover:shadow-lg"
          >
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>
          <p className="text-sm text-[#666666] text-center">
            {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-[#666666] hover:text-[#555555] underline"
            >
              {isSignup ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </form>
      </div>
    </div>
    </>
  );
};

export default SignupLogin;