import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/register.css'; // custom CSS import
import { useDispatch } from "react-redux";
import { setUser } from "../store/authSlice";

const Register = () => {
  const [form, setForm] = useState({ email: '', firstname: '', lastname: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // handle input change
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  // handle form submit
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/register",
        {
          email: form.email,
          fullName: {
            firstName: form.firstname,
            lastName: form.lastname
          },
          password: form.password
        },
        { withCredentials: true }
      );

      // Redux me user set karo
      dispatch(setUser(res.data.user));

      // Home page navigate
      navigate("/");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="register-container">
      <div className="register-card" role="main" aria-labelledby="register-heading">
        <header className="register-header">
          <h1 id="register-heading">Create account</h1>
          <p>Join us and start exploring.</p>
        </header>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstname">First name</label>
              <input id="firstname" name="firstname" placeholder="Jane"
                value={form.firstname} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="lastname">Last name</label>
              <input id="lastname" name="lastname" placeholder="Doe"
                value={form.lastname} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Create a password"
              value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="register-alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
