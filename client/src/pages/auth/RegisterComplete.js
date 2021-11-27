import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import FromGroup from "../../components/form/FromGroup";
import { toast } from "react-toastify";
function RegisterComplete({ history }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setEmail(window.localStorage.getItem("emailForRegistration"));
    // console.log(window.location.href);
    // console.log(window.localStorage.getItem("emailForRegistration"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password is required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    try {
      const result = await auth.signInWithEmailLink(email, window.location.href);
      //   console.log("RESULT", result);
      if (result.user.emailVerified) {
        // remove user email fom local storage
        window.localStorage.removeItem("emailForRegistration");
        // get user id token
        let user = auth.currentUser;
        await user.updatePassword(password);
        const idTokenResult = await user.getIdTokenResult();
        // redux store
        console.log("user", user, "idTokenResult", idTokenResult);
        // redirect
        // history.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const completeRegistrationForm = () => (
    <form className="form" onSubmit={handleSubmit}>
      <h1 className="form-title">React Register</h1>
      <FromGroup
        id="email"
        label="Email"
        type="email"
        name="email"
        value={email}
        placeholder="Nhập email..."
        disabled={true}
        onChange={(e) => setEmail(e.target.value)}
      />
      <FromGroup
        id="password"
        label="Password"
        type="password"
        name="password"
        value={password}
        placeholder="Nhập password..."
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="btn btn-register">
        Complete Registration
      </button>
    </form>
  );

  return <div className="container">{completeRegistrationForm()}</div>;
}
export default RegisterComplete;
